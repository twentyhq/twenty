import {
  BadRequestException,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';

import { isDefined } from 'twenty-shared/utils';
import { In } from 'typeorm';

import {
  type PersonDuplicateGroupDTO,
  type PersonDuplicateGroupsDTO,
  type PersonDuplicatePairInput,
  type PersonDuplicatePersonDTO,
} from 'src/engine/core-modules/person-duplicate-review/dtos/person-duplicate-review.dto';
import { PersonDuplicatePairDecisionEntity } from 'src/engine/core-modules/person-duplicate-review/entities/person-duplicate-pair-decision.entity';
import {
  buildPersonDuplicateGroups,
  getPersonDuplicateIdentity,
  getSortedPersonPair,
} from 'src/engine/core-modules/person-duplicate-review/utils/person-duplicate-review.util';
import { type WorkspaceAuthContext } from 'src/engine/core-modules/auth/types/workspace-auth-context.type';
import { GlobalWorkspaceOrmManager } from 'src/engine/twenty-orm/global-workspace-datasource/global-workspace-orm.manager';
import { getWorkspaceContext } from 'src/engine/twenty-orm/storage/orm-workspace-context.storage';
import { getObjectsPermissionsFromRolePermissionConfig } from 'src/engine/twenty-orm/utils/get-objects-permissions-from-role-permission-config.util';
import { resolveRolePermissionConfig } from 'src/engine/twenty-orm/utils/resolve-role-permission-config.util';
import { InjectWorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/inject-workspace-scoped-repository.decorator';
import { WorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/workspace-scoped-repository';
import { type PersonWorkspaceEntity } from 'src/modules/person/standard-objects/person.workspace-entity';

@Injectable()
export class PersonDuplicateReviewService {
  constructor(
    private readonly globalWorkspaceOrmManager: GlobalWorkspaceOrmManager,
    @InjectWorkspaceScopedRepository(PersonDuplicatePairDecisionEntity)
    private readonly personDuplicatePairDecisionRepository: WorkspaceScopedRepository<PersonDuplicatePairDecisionEntity>,
  ) {}

  async getDuplicateGroups({
    authContext,
  }: {
    authContext: WorkspaceAuthContext;
  }): Promise<PersonDuplicateGroupsDTO> {
    return this.globalWorkspaceOrmManager.executeInWorkspaceContext(
      async () => {
        const { personRepository, canResolve } =
          await this.getPersonRepositoryAndPermissions(authContext);
        const people = await personRepository.find({
          relations: {
            company: true,
          },
        });
        const decisions = await this.personDuplicatePairDecisionRepository.find(
          authContext.workspace.id,
        );
        const groups = buildPersonDuplicateGroups({
          people,
          decisions,
        }).map(
          (group): PersonDuplicateGroupDTO => ({
            id: group.id,
            reasons: group.reasons,
            detectedAt: group.detectedAt,
            people: group.people.map(this.toPersonDTO),
          }),
        );

        return {
          groups,
          totalCount: groups.length,
          canResolve,
        };
      },
      authContext,
    );
  }

  async keepSeparate({
    authContext,
    workspaceMemberId,
    pairs,
  }: {
    authContext: WorkspaceAuthContext;
    workspaceMemberId: string;
    pairs: PersonDuplicatePairInput[];
  }): Promise<boolean> {
    if (pairs.length === 0 || pairs.length > 100) {
      throw new BadRequestException(
        'Between 1 and 100 duplicate pairs are required.',
      );
    }

    return this.globalWorkspaceOrmManager.executeInWorkspaceContext(
      async () => {
        const { personRepository, canResolve } =
          await this.getPersonRepositoryAndPermissions(authContext);

        if (!canResolve) {
          throw new ForbiddenException(
            'People edit and delete permissions are required to resolve duplicates.',
          );
        }

        const personIds = [
          ...new Set(
            pairs.flatMap(({ leftPersonId, rightPersonId }) => [
              leftPersonId,
              rightPersonId,
            ]),
          ),
        ];
        const people = await personRepository.find({
          where: {
            id: In(personIds),
          },
        });

        if (people.length !== personIds.length) {
          throw new BadRequestException(
            'One or more people no longer exist or are not visible.',
          );
        }

        const peopleById = new Map(people.map((person) => [person.id, person]));
        const decisionRows = pairs.map(({ leftPersonId, rightPersonId }) => {
          if (leftPersonId === rightPersonId) {
            throw new BadRequestException(
              'A person cannot be kept separate from itself.',
            );
          }

          const [sortedLeftPersonId, sortedRightPersonId] = getSortedPersonPair(
            leftPersonId,
            rightPersonId,
          );

          const leftPerson = peopleById.get(sortedLeftPersonId);
          const rightPerson = peopleById.get(sortedRightPersonId);

          if (!leftPerson || !rightPerson) {
            throw new BadRequestException('Duplicate pair could not be found.');
          }

          return {
            workspaceId: authContext.workspace.id,
            leftPersonId: sortedLeftPersonId,
            rightPersonId: sortedRightPersonId,
            leftFingerprint: getPersonDuplicateIdentity(leftPerson).fingerprint,
            rightFingerprint:
              getPersonDuplicateIdentity(rightPerson).fingerprint,
            resolvedByWorkspaceMemberId: workspaceMemberId,
          };
        });

        await this.personDuplicatePairDecisionRepository.upsert(
          authContext.workspace.id,
          decisionRows,
          {
            conflictPaths: ['workspaceId', 'leftPersonId', 'rightPersonId'],
            skipUpdateIfNoValuesChanged: false,
          },
        );

        return true;
      },
      authContext,
    );
  }

  private async getPersonRepositoryAndPermissions(
    authContext: WorkspaceAuthContext,
  ) {
    const context = getWorkspaceContext();
    const rolePermissionConfig = resolveRolePermissionConfig({
      authContext,
      userWorkspaceRoleMap: context.userWorkspaceRoleMap,
      apiKeyRoleMap: context.apiKeyRoleMap,
    });

    if (!isDefined(rolePermissionConfig)) {
      throw new ForbiddenException('No role is assigned to this workspace.');
    }

    const objectsPermissions = getObjectsPermissionsFromRolePermissionConfig({
      rolesPermissions: context.permissionsPerRoleId,
      rolePermissionConfig,
    });
    const personObjectMetadataId = context.objectIdByNameSingular.person;
    const personPermissions = objectsPermissions[personObjectMetadataId];
    const personRepository =
      await this.globalWorkspaceOrmManager.getRepository<PersonWorkspaceEntity>(
        authContext.workspace.id,
        'person',
        rolePermissionConfig,
      );

    return {
      personRepository,
      canResolve:
        personPermissions?.canUpdateObjectRecords === true &&
        personPermissions?.canSoftDeleteObjectRecords === true,
    };
  }

  private readonly toPersonDTO = (
    person: PersonWorkspaceEntity,
  ): PersonDuplicatePersonDTO => ({
    id: person.id,
    firstName: person.name?.firstName ?? '',
    lastName: person.name?.lastName ?? '',
    emails: [
      person.emails?.primaryEmail,
      ...(person.emails?.additionalEmails ?? []),
    ].filter((email): email is string => Boolean(email)),
    phones: [
      ...(person.phones?.primaryPhoneNumber
        ? [
            {
              number: person.phones.primaryPhoneNumber,
              countryCode: person.phones.primaryPhoneCountryCode ?? '',
              callingCode: person.phones.primaryPhoneCallingCode ?? '',
            },
          ]
        : []),
      ...(person.phones?.additionalPhones ?? []),
    ],
    linkedinLinks: [
      ...(person.linkedinLink?.primaryLinkUrl
        ? [
            {
              label: person.linkedinLink.primaryLinkLabel ?? '',
              url: person.linkedinLink.primaryLinkUrl,
            },
          ]
        : []),
      ...(person.linkedinLink?.secondaryLinks ?? []),
    ],
    jobTitle: person.jobTitle ?? '',
    company: person.company
      ? {
          id: person.company.id,
          name: person.company.name ?? '',
        }
      : null,
    avatarUrl: person.avatarUrl ?? '',
    createdByName: person.createdBy?.name ?? '',
    createdAt: new Date(person.createdAt),
    updatedAt: new Date(person.updatedAt),
  });
}
