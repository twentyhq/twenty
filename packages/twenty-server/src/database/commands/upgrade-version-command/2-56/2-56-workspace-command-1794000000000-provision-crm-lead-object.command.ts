import { Command } from 'nest-commander';
import { STANDARD_OBJECTS } from 'twenty-shared/metadata';
import {
  FieldMetadataType,
  RelationType,
  ViewCalendarLayout,
  ViewKey,
  ViewType,
  ViewVisibility,
  NavigationMenuItemType,
} from 'twenty-shared/types';
import { doNotTranslate } from 'twenty-shared/i18n';
import { isDefined } from 'twenty-shared/utils';

import {
  ProvisionedWorkspaceCommandRunner,
  type ProvisionedWorkspaceCommandOptions,
} from 'src/database/commands/command-runners/provisioned-workspace.command-runner';
import { WorkspaceIteratorService } from 'src/database/commands/command-runners/workspace-iterator.service';
import { type RunOnWorkspaceArgs } from 'src/database/commands/command-runners/workspace.command-runner';
import { ApplicationService } from 'src/engine/core-modules/application/application.service';
import { fromCreateViewFieldInputToFlatViewFieldToCreate } from 'src/engine/metadata-modules/flat-view-field/utils/from-create-view-field-input-to-flat-view-field-to-create.util';
import { addFlatNavigationMenuItemToMapsAndUpdateIndex } from 'src/engine/metadata-modules/flat-navigation-menu-item/utils/add-flat-navigation-menu-item-to-maps-and-update-index.util';
import { fromCreateNavigationMenuItemInputToFlatNavigationMenuItemToCreate } from 'src/engine/metadata-modules/flat-navigation-menu-item/utils/from-create-navigation-menu-item-input-to-flat-navigation-menu-item-to-create.util';
import { fromCreateViewInputToFlatViewToCreate } from 'src/engine/metadata-modules/flat-view/utils/from-create-view-input-to-flat-view-to-create.util';
import { ObjectMetadataService } from 'src/engine/metadata-modules/object-metadata/object-metadata.service';
import { type CreateFieldInput } from 'src/engine/metadata-modules/field-metadata/dtos/create-field.input';
import { FieldMetadataService } from 'src/engine/metadata-modules/field-metadata/services/field-metadata.service';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { WorkspaceMigrationBuilderException } from 'src/engine/workspace-manager/workspace-migration/exceptions/workspace-migration-builder-exception';
import { WorkspaceMigrationValidateBuildAndRunService } from 'src/engine/workspace-manager/workspace-migration/services/workspace-migration-validate-build-and-run-service';

const CRM_LEAD_OBJECT_UNIVERSAL_IDENTIFIER =
  'c6240a9b-1c7a-4ef5-8cb7-4e42d1c094e1';

const CRM_LEAD_VIEW_IDENTIFIERS = {
  pipeline: {
    id: 'd6240a9b-1c7a-4ef5-8cb7-4e42d1c094e1',
    universalIdentifier: 'd6240a9b-1c7a-4ef5-8cb7-4e42d1c094e2',
  },
  followUpCalendar: {
    id: 'd6240a9b-1c7a-4ef5-8cb7-4e42d1c094e3',
    universalIdentifier: 'd6240a9b-1c7a-4ef5-8cb7-4e42d1c094e4',
  },
  followUpDay: {
    id: 'd6240a9b-1c7a-4ef5-8cb7-4e42d1c094e5',
    universalIdentifier: 'b6240a9b-1c7a-4ef5-8cb7-4e42d1c094e1',
  },
} as const;

const CRM_LEAD_VIEW_FIELD_UNIVERSAL_IDENTIFIERS = {
  allLeads: [
    'e6240a9b-1c7a-4ef5-8cb7-4e42d1c094e1',
    'e6240a9b-1c7a-4ef5-8cb7-4e42d1c094e2',
    'e6240a9b-1c7a-4ef5-8cb7-4e42d1c094e3',
    'e6240a9b-1c7a-4ef5-8cb7-4e42d1c094e4',
    'e6240a9b-1c7a-4ef5-8cb7-4e42d1c094e5',
    'e6240a9b-1c7a-4ef5-8cb7-4e42d1c094e6',
    'e6240a9b-1c7a-4ef5-8cb7-4e42d1c094e7',
    'e6240a9b-1c7a-4ef5-8cb7-4e42d1c094e8',
    'e6240a9b-1c7a-4ef5-8cb7-4e42d1c094e9',
  ],
  pipeline: [
    'd6240a9b-1c7a-4ef5-8cb7-4e42d1c094e5',
    'd6240a9b-1c7a-4ef5-8cb7-4e42d1c094e6',
    'd6240a9b-1c7a-4ef5-8cb7-4e42d1c094e7',
    'd6240a9b-1c7a-4ef5-8cb7-4e42d1c094e8',
    'd6240a9b-1c7a-4ef5-8cb7-4e42d1c094e9',
    'd6240a9b-1c7a-4ef5-8cb7-4e42d1c094ea',
    'd6240a9b-1c7a-4ef5-8cb7-4e42d1c094ef',
    'c7240a9b-1c7a-4ef5-8cb7-4e42d1c094e2',
  ],
  followUpCalendar: [
    'd6240a9b-1c7a-4ef5-8cb7-4e42d1c094eb',
    'd6240a9b-1c7a-4ef5-8cb7-4e42d1c094ec',
    'd6240a9b-1c7a-4ef5-8cb7-4e42d1c094ed',
    'd6240a9b-1c7a-4ef5-8cb7-4e42d1c094ee',
    'c7240a9b-1c7a-4ef5-8cb7-4e42d1c094e3',
  ],
  followUpDay: [
    'f6240a9b-1c7a-4ef5-8cb7-4e42d1c094e1',
    'f6240a9b-1c7a-4ef5-8cb7-4e42d1c094e2',
    'f6240a9b-1c7a-4ef5-8cb7-4e42d1c094e3',
    'f6240a9b-1c7a-4ef5-8cb7-4e42d1c094e4',
    'f6240a9b-1c7a-4ef5-8cb7-4e42d1c094e5',
  ],
} as const;

const CRM_NAVIGATION_MENU_ITEM_IDS = {
  folder: 'a6240a9b-1c7a-4ef5-8cb7-4e42d1c094e1',
  pipeline: 'a6240a9b-1c7a-4ef5-8cb7-4e42d1c094e2',
  allLeads: 'a6240a9b-1c7a-4ef5-8cb7-4e42d1c094e3',
  followUps: 'a6240a9b-1c7a-4ef5-8cb7-4e42d1c094e4',
  dailyFollowUps: 'a6240a9b-1c7a-4ef5-8cb7-4e42d1c094e5',
} as const;

const CRM_LEAD_FIELD_UNIVERSAL_IDENTIFIERS = {
  company: 'c6240a9b-1c7a-4ef5-8cb7-4e42d1c094e2',
  emails: 'c6240a9b-1c7a-4ef5-8cb7-4e42d1c094e3',
  phones: 'c6240a9b-1c7a-4ef5-8cb7-4e42d1c094e4',
  source: 'c6240a9b-1c7a-4ef5-8cb7-4e42d1c094e5',
  serviceInterest: 'c7240a9b-1c7a-4ef5-8cb7-4e42d1c094e1',
  stage: 'c6240a9b-1c7a-4ef5-8cb7-4e42d1c094e6',
  assignedTo: 'c6240a9b-1c7a-4ef5-8cb7-4e42d1c094e7',
  nextFollowUpAt: 'c6240a9b-1c7a-4ef5-8cb7-4e42d1c094e8',
  lastContactedAt: 'c6240a9b-1c7a-4ef5-8cb7-4e42d1c094e9',
  notes: 'c6240a9b-1c7a-4ef5-8cb7-4e42d1c094ea',
  tasks: 'c7240a9b-1c7a-4ef5-8cb7-4e42d1c094e8',
} as const;

@Command({
  name: 'crm:provision-lead-object',
  description: doNotTranslate(
    'Create the CRM Lead object and its fields in one workspace',
  ),
})
export class ProvisionCrmLeadObjectCommand extends ProvisionedWorkspaceCommandRunner<ProvisionedWorkspaceCommandOptions> {
  constructor(
    protected readonly workspaceIteratorService: WorkspaceIteratorService,
    private readonly workspaceCacheService: WorkspaceCacheService,
    private readonly objectMetadataService: ObjectMetadataService,
    private readonly fieldMetadataService: FieldMetadataService,
    private readonly applicationService: ApplicationService,
    private readonly workspaceMigrationValidateBuildAndRunService: WorkspaceMigrationValidateBuildAndRunService,
  ) {
    super(workspaceIteratorService);
  }

  override async run(
    passedParams: string[],
    options: ProvisionedWorkspaceCommandOptions,
  ): Promise<void> {
    if (!options.workspaceId || options.workspaceId.size !== 1) {
      throw new Error(
        'This CRM provisioning command requires exactly one --workspace-id. It is intentionally blocked from running across every workspace.',
      );
    }

    await super.run(passedParams, options);
  }

  override async runOnWorkspace({
    workspaceId,
    options,
  }: RunOnWorkspaceArgs): Promise<void> {
    const { flatObjectMetadataMaps } =
      await this.workspaceCacheService.getOrRecompute(workspaceId, [
        'flatObjectMetadataMaps',
      ]);

    let leadObjectMetadata =
      flatObjectMetadataMaps.byUniversalIdentifier[
        CRM_LEAD_OBJECT_UNIVERSAL_IDENTIFIER
      ];

    if (!isDefined(leadObjectMetadata)) {
      const conflictingObject = Object.values(
        flatObjectMetadataMaps.byUniversalIdentifier,
      )
        .filter(isDefined)
        .find(
          (objectMetadata) =>
            objectMetadata.nameSingular.toLowerCase() === 'lead' ||
            objectMetadata.namePlural.toLowerCase() === 'leads',
        );

      if (isDefined(conflictingObject)) {
        throw new Error(
          `Cannot create CRM Lead: workspace ${workspaceId} already contains an object named "${conflictingObject.nameSingular}" with a different identifier.`,
        );
      }

      if (options.dryRun) {
        this.logger.log(
          doNotTranslate(
            `[DRY RUN] Would create the CRM Lead object and its fields in workspace ${workspaceId}`,
          ),
        );

        return;
      }

      leadObjectMetadata = await this.objectMetadataService.createOneObject({
        workspaceId,
        createObjectInput: {
          nameSingular: 'lead',
          namePlural: 'leads',
          labelSingular: 'Lead',
          labelPlural: 'Leads',
          description:
            'CRM lead records for prospect qualification and follow-up.',
          icon: 'IconTarget',
          universalIdentifier: CRM_LEAD_OBJECT_UNIVERSAL_IDENTIFIER,
        },
      });

      this.logger.log(
        doNotTranslate(
          `Created CRM Lead object (${leadObjectMetadata.id}) in workspace ${workspaceId}`,
        ),
      );
    }

    const {
      flatObjectMetadataMaps: refreshedFlatObjectMetadataMaps,
      flatFieldMetadataMaps,
    } = await this.workspaceCacheService.getOrRecompute(workspaceId, [
      'flatObjectMetadataMaps',
      'flatFieldMetadataMaps',
    ]);

    leadObjectMetadata =
      refreshedFlatObjectMetadataMaps.byUniversalIdentifier[
        CRM_LEAD_OBJECT_UNIVERSAL_IDENTIFIER
      ];

    if (!isDefined(leadObjectMetadata)) {
      throw new Error(
        `CRM Lead object was not available after provisioning in workspace ${workspaceId}.`,
      );
    }

    const workspaceMemberObjectMetadata =
      refreshedFlatObjectMetadataMaps.byUniversalIdentifier[
        STANDARD_OBJECTS.workspaceMember.universalIdentifier
      ];

    if (!isDefined(workspaceMemberObjectMetadata)) {
      throw new Error(
        `Cannot provision CRM Lead assignment: workspaceMember object is missing in workspace ${workspaceId}.`,
      );
    }

    const taskObjectMetadata =
      refreshedFlatObjectMetadataMaps.byUniversalIdentifier[
        STANDARD_OBJECTS.task.universalIdentifier
      ];

    if (!isDefined(taskObjectMetadata)) {
      throw new Error(
        `Cannot provision CRM Lead tasks: standard Task object is missing in workspace ${workspaceId}.`,
      );
    }

    const createFieldInputs: Omit<CreateFieldInput, 'workspaceId'>[] = [
      {
        objectMetadataId: leadObjectMetadata.id,
        universalIdentifier:
          CRM_LEAD_FIELD_UNIVERSAL_IDENTIFIERS.company,
        type: FieldMetadataType.TEXT,
        name: 'company',
        label: 'Company',
        description: 'Company or organization associated with this lead.',
        icon: 'IconBuilding',
        isNullable: true,
        isSearchable: true,
      },
      {
        objectMetadataId: leadObjectMetadata.id,
        universalIdentifier:
          CRM_LEAD_FIELD_UNIVERSAL_IDENTIFIERS.emails,
        type: FieldMetadataType.EMAILS,
        name: 'emails',
        label: 'Email',
        description: 'Primary email address for this lead.',
        icon: 'IconMail',
        isNullable: true,
        settings: { maxNumberOfValues: 1 },
      },
      {
        objectMetadataId: leadObjectMetadata.id,
        universalIdentifier:
          CRM_LEAD_FIELD_UNIVERSAL_IDENTIFIERS.phones,
        type: FieldMetadataType.PHONES,
        name: 'phones',
        label: 'Phone',
        description: 'Primary phone number for this lead.',
        icon: 'IconPhone',
        isNullable: true,
        settings: { maxNumberOfValues: 1 },
      },
      {
        objectMetadataId: leadObjectMetadata.id,
        universalIdentifier:
          CRM_LEAD_FIELD_UNIVERSAL_IDENTIFIERS.source,
        type: FieldMetadataType.SELECT,
        name: 'source',
        label: 'Source',
        description: 'How this lead entered the CRM.',
        icon: 'IconRoute',
        isNullable: true,
        options: [
          {
            id: 'c6240a9b-1c7a-4ef5-8cb7-4e42d1c094eb',
            value: 'WEBSITE',
            label: 'Website',
            position: 0,
            color: 'blue',
          },
          {
            id: 'c6240a9b-1c7a-4ef5-8cb7-4e42d1c094ec',
            value: 'REFERRAL',
            label: 'Referral',
            position: 1,
            color: 'green',
          },
          {
            id: 'c6240a9b-1c7a-4ef5-8cb7-4e42d1c094ed',
            value: 'LINKEDIN',
            label: 'LinkedIn',
            position: 2,
            color: 'turquoise',
          },
          {
            id: 'c6240a9b-1c7a-4ef5-8cb7-4e42d1c094ee',
            value: 'COLD_CALL',
            label: 'Cold call',
            position: 3,
            color: 'orange',
          },
          {
            id: 'c6240a9b-1c7a-4ef5-8cb7-4e42d1c094ef',
            value: 'EMAIL_CAMPAIGN',
            label: 'Email campaign',
            position: 4,
            color: 'violet',
          },
          {
            id: 'c6240a9b-1c7a-4ef5-8cb7-4e42d1c094f0',
            value: 'OTHER',
            label: 'Other',
            position: 5,
            color: 'gray',
          },
        ],
      },
      {
        objectMetadataId: leadObjectMetadata.id,
        universalIdentifier:
          CRM_LEAD_FIELD_UNIVERSAL_IDENTIFIERS.serviceInterest,
        type: FieldMetadataType.SELECT,
        name: 'serviceInterest',
        label: 'Service Interest',
        description:
          'The Corent service line this prospect is interested in.',
        icon: 'IconLayers',
        isNullable: true,
        options: [
          {
            id: 'c7240a9b-1c7a-4ef5-8cb7-4e42d1c094e4',
            value: 'FUNDING_COMPLIANCE',
            label: 'Funding & Compliance',
            position: 0,
            color: 'blue',
          },
          {
            id: 'c7240a9b-1c7a-4ef5-8cb7-4e42d1c094e5',
            value: 'AI_TOOLS_WEBSITES',
            label: 'AI Tools & Websites',
            position: 1,
            color: 'violet',
          },
          {
            id: 'c7240a9b-1c7a-4ef5-8cb7-4e42d1c094e6',
            value: 'AUTOMATION',
            label: 'Automation',
            position: 2,
            color: 'turquoise',
          },
          {
            id: 'c7240a9b-1c7a-4ef5-8cb7-4e42d1c094e7',
            value: 'DIGITAL_MARKETING',
            label: 'Digital Marketing',
            position: 3,
            color: 'orange',
          },
        ],
      },
      {
        objectMetadataId: leadObjectMetadata.id,
        universalIdentifier:
          CRM_LEAD_FIELD_UNIVERSAL_IDENTIFIERS.stage,
        type: FieldMetadataType.SELECT,
        name: 'stage',
        label: 'Stage',
        description: 'Current qualification stage of this lead.',
        icon: 'IconProgressCheck',
        isNullable: false,
        defaultValue: "'COLD'",
        options: [
          {
            id: 'c6240a9b-1c7a-4ef5-8cb7-4e42d1c094f1',
            value: 'COLD',
            label: 'Cold',
            position: 0,
            color: 'gray',
          },
          {
            id: 'c6240a9b-1c7a-4ef5-8cb7-4e42d1c094f2',
            value: 'WARM',
            label: 'Warm',
            position: 1,
            color: 'amber',
          },
          {
            id: 'c6240a9b-1c7a-4ef5-8cb7-4e42d1c094f3',
            value: 'HOT',
            label: 'Hot',
            position: 2,
            color: 'red',
          },
        ],
      },
      {
        objectMetadataId: leadObjectMetadata.id,
        universalIdentifier:
          CRM_LEAD_FIELD_UNIVERSAL_IDENTIFIERS.assignedTo,
        type: FieldMetadataType.RELATION,
        name: 'assignedTo',
        label: 'Assigned To',
        description: 'Workspace member responsible for this lead.',
        icon: 'IconUser',
        isNullable: true,
        relationCreationPayload: {
          type: RelationType.MANY_TO_ONE,
          targetObjectMetadataId: workspaceMemberObjectMetadata.id,
          targetFieldLabel: 'Assigned Leads',
          targetFieldIcon: 'IconTarget',
        },
      },
      {
        objectMetadataId: leadObjectMetadata.id,
        universalIdentifier: CRM_LEAD_FIELD_UNIVERSAL_IDENTIFIERS.tasks,
        type: FieldMetadataType.RELATION,
        name: 'tasks',
        label: 'Tasks',
        description: 'Tasks and follow-ups linked to this Lead.',
        icon: 'IconCheckbox',
        isNullable: true,
        relationCreationPayload: {
          type: RelationType.ONE_TO_MANY,
          targetObjectMetadataId: taskObjectMetadata.id,
          targetFieldLabel: 'Lead',
          targetFieldIcon: 'IconTarget',
        },
      },
      {
        objectMetadataId: leadObjectMetadata.id,
        universalIdentifier:
          CRM_LEAD_FIELD_UNIVERSAL_IDENTIFIERS.nextFollowUpAt,
        type: FieldMetadataType.DATE_TIME,
        name: 'nextFollowUpAt',
        label: 'Next Follow-up',
        description: 'Date and time for the next planned follow-up.',
        icon: 'IconCalendarClock',
        isNullable: true,
      },
      {
        objectMetadataId: leadObjectMetadata.id,
        universalIdentifier:
          CRM_LEAD_FIELD_UNIVERSAL_IDENTIFIERS.lastContactedAt,
        type: FieldMetadataType.DATE_TIME,
        name: 'lastContactedAt',
        label: 'Last Contacted',
        description: 'Date and time this lead was last contacted.',
        icon: 'IconCalendarCheck',
        isNullable: true,
      },
      {
        objectMetadataId: leadObjectMetadata.id,
        universalIdentifier: CRM_LEAD_FIELD_UNIVERSAL_IDENTIFIERS.notes,
        type: FieldMetadataType.RICH_TEXT,
        name: 'notes',
        label: 'Notes',
        description: 'Notes and context about this lead.',
        icon: 'IconNotes',
        isNullable: true,
      },
    ];

    const conflictingUniversalIdentifierField = createFieldInputs
      .map((expectedField) => ({
        expectedField,
        existingField:
          flatFieldMetadataMaps.byUniversalIdentifier[
            expectedField.universalIdentifier ?? ''
          ],
      }))
      .find(
        ({ expectedField, existingField }) =>
          isDefined(existingField) &&
          (existingField.objectMetadataId !== leadObjectMetadata.id ||
            existingField.name !== expectedField.name ||
            existingField.type !== expectedField.type),
      );

    if (isDefined(conflictingUniversalIdentifierField)) {
      throw new Error(
        `Cannot provision CRM Lead field "${conflictingUniversalIdentifierField.expectedField.name}" in workspace ${workspaceId}: its universal identifier is already used by a different field.`,
      );
    }

    const expectedFieldUniversalIdentifiersByName = new Map(
      createFieldInputs.map((field) => [
        field.name,
        field.universalIdentifier,
      ]),
    );

    const conflictingField = Object.values(
      flatFieldMetadataMaps.byUniversalIdentifier,
    )
      .filter(isDefined)
      .find(
        (field) =>
          field.objectMetadataId === leadObjectMetadata.id &&
          expectedFieldUniversalIdentifiersByName.has(field.name) &&
          expectedFieldUniversalIdentifiersByName.get(field.name) !==
            field.universalIdentifier,
      );

    if (isDefined(conflictingField)) {
      throw new Error(
        `Cannot provision CRM Lead field "${conflictingField.name}" in workspace ${workspaceId}: a field with the same name already exists with a different identifier.`,
      );
    }

    const missingFieldInputs = createFieldInputs.filter(
      (field) =>
        !isDefined(
          flatFieldMetadataMaps.byUniversalIdentifier[
            field.universalIdentifier ?? ''
          ],
        ),
    );

    if (missingFieldInputs.length === 0) {
      this.logger.log(
        doNotTranslate(
          `CRM Lead object and all ${createFieldInputs.length} custom fields are already present in workspace ${workspaceId}; skipping field creation`,
        ),
      );
    } else {
      if (options.dryRun) {
        this.logger.log(
          doNotTranslate(
            `[DRY RUN] Would create ${missingFieldInputs.length} CRM Lead field(s) in workspace ${workspaceId}: ${missingFieldInputs.map((field) => field.name).join(', ')}`,
          ),
        );

        return;
      }

      await this.fieldMetadataService.createManyFields({
        createFieldInputs: missingFieldInputs,
        workspaceId,
        shouldDeferActions: false,
      });

      this.logger.log(
        doNotTranslate(
          `Created ${missingFieldInputs.length} CRM Lead field(s) in workspace ${workspaceId}: ${missingFieldInputs.map((field) => field.name).join(', ')}`,
        ),
      );
    }

    await this.ensureLeadViews({
      workspaceId,
      leadObjectMetadataId: leadObjectMetadata.id,
      options,
    });
  }

  private async ensureLeadViews({
    workspaceId,
    leadObjectMetadataId,
    options,
  }: {
    workspaceId: string;
    leadObjectMetadataId: string;
    options: ProvisionedWorkspaceCommandOptions;
  }): Promise<void> {
    const {
      flatObjectMetadataMaps,
      flatFieldMetadataMaps,
      flatViewMaps,
      flatViewFieldMaps,
      flatViewFieldGroupMaps,
    } = await this.workspaceCacheService.getOrRecompute(workspaceId, [
      'flatObjectMetadataMaps',
      'flatFieldMetadataMaps',
      'flatViewMaps',
      'flatViewFieldMaps',
      'flatViewFieldGroupMaps',
    ]);

    const workspaceCustomFlatApplication =
      (
        await this.applicationService.findWorkspaceTwentyStandardAndCustomApplicationOrThrow({
          workspaceId,
        })
      ).workspaceCustomFlatApplication;

    const getLeadField = (universalIdentifier: string) => {
      const field = flatFieldMetadataMaps.byUniversalIdentifier[
        universalIdentifier
      ];

      if (!isDefined(field) || field.objectMetadataId !== leadObjectMetadataId) {
        throw new Error(
          `Required CRM Lead field ${universalIdentifier} is missing in workspace ${workspaceId}.`,
        );
      }

      return field;
    };

    const nameField = Object.values(
      flatFieldMetadataMaps.byUniversalIdentifier,
    )
      .filter(isDefined)
      .find(
        (field) =>
          field.objectMetadataId === leadObjectMetadataId &&
          field.name === 'name',
      );

    if (!isDefined(nameField)) {
      throw new Error(
        `Required built-in Lead Name field is missing in workspace ${workspaceId}.`,
      );
    }

    const companyField = getLeadField(
      CRM_LEAD_FIELD_UNIVERSAL_IDENTIFIERS.company,
    );
    const emailsField = getLeadField(
      CRM_LEAD_FIELD_UNIVERSAL_IDENTIFIERS.emails,
    );
    const phonesField = getLeadField(
      CRM_LEAD_FIELD_UNIVERSAL_IDENTIFIERS.phones,
    );
    const sourceField = getLeadField(
      CRM_LEAD_FIELD_UNIVERSAL_IDENTIFIERS.source,
    );
    const stageField = getLeadField(
      CRM_LEAD_FIELD_UNIVERSAL_IDENTIFIERS.stage,
    );
    const serviceInterestField = getLeadField(
      CRM_LEAD_FIELD_UNIVERSAL_IDENTIFIERS.serviceInterest,
    );
    const assignedToField = getLeadField(
      CRM_LEAD_FIELD_UNIVERSAL_IDENTIFIERS.assignedTo,
    );
    const nextFollowUpAtField = getLeadField(
      CRM_LEAD_FIELD_UNIVERSAL_IDENTIFIERS.nextFollowUpAt,
    );
    const lastContactedAtField = getLeadField(
      CRM_LEAD_FIELD_UNIVERSAL_IDENTIFIERS.lastContactedAt,
    );
    const viewDefinitions = [
      {
        identifier: CRM_LEAD_VIEW_IDENTIFIERS.pipeline,
        name: 'Lead Pipeline',
        type: ViewType.KANBAN,
        icon: 'IconLayoutKanban',
        position: 0,
        mainGroupByFieldMetadataId: stageField.id,
        fields: [
          nameField.id,
          companyField.id,
          emailsField.id,
          phonesField.id,
          sourceField.id,
          serviceInterestField.id,
          assignedToField.id,
          nextFollowUpAtField.id,
        ],
        fieldUniversalIdentifiers:
          CRM_LEAD_VIEW_FIELD_UNIVERSAL_IDENTIFIERS.pipeline,
      },
      {
        identifier: CRM_LEAD_VIEW_IDENTIFIERS.followUpCalendar,
        name: 'Lead Follow-ups',
        type: ViewType.CALENDAR,
        icon: 'IconCalendarClock',
        position: 2,
        calendarLayout: ViewCalendarLayout.WEEK,
        calendarFieldMetadataId: nextFollowUpAtField.id,
        fields: [
          nameField.id,
          companyField.id,
          assignedToField.id,
          stageField.id,
          serviceInterestField.id,
        ],
        fieldUniversalIdentifiers:
          CRM_LEAD_VIEW_FIELD_UNIVERSAL_IDENTIFIERS.followUpCalendar,
      },
      {
        identifier: CRM_LEAD_VIEW_IDENTIFIERS.followUpDay,
        name: 'Daily Follow-ups',
        type: ViewType.CALENDAR,
        icon: 'IconCalendarTime',
        position: 1,
        calendarLayout: ViewCalendarLayout.DAY,
        calendarFieldMetadataId: nextFollowUpAtField.id,
        fields: [
          nameField.id,
          companyField.id,
          assignedToField.id,
          stageField.id,
          serviceInterestField.id,
        ],
        fieldUniversalIdentifiers:
          CRM_LEAD_VIEW_FIELD_UNIVERSAL_IDENTIFIERS.followUpDay,
      },
    ] as const;

    const allLeadsIndexView = Object.values(
      flatViewMaps.byUniversalIdentifier,
    )
      .filter(isDefined)
      .find(
        (view) =>
          view.objectMetadataId === leadObjectMetadataId &&
          view.key === ViewKey.INDEX &&
          view.type === ViewType.TABLE,
      );

    if (!isDefined(allLeadsIndexView)) {
      throw new Error(
        `The native All Leads index view is missing in workspace ${workspaceId}.`,
      );
    }

    const allLeadsTableFields = [
      companyField.id,
      emailsField.id,
      phonesField.id,
      sourceField.id,
      serviceInterestField.id,
      stageField.id,
      assignedToField.id,
      nextFollowUpAtField.id,
      lastContactedAtField.id,
    ];

    const tableViewFieldsToCreate = allLeadsTableFields
      .map((fieldMetadataId, index) => ({
        fieldMetadataId,
        universalIdentifier:
          CRM_LEAD_VIEW_FIELD_UNIVERSAL_IDENTIFIERS.allLeads[index],
        position: index + 1,
      }))
      .filter(({ fieldMetadataId, universalIdentifier }) => {
        const existingWithUniversalIdentifier =
          flatViewFieldMaps.byUniversalIdentifier[universalIdentifier];

        if (isDefined(existingWithUniversalIdentifier)) {
          if (
            existingWithUniversalIdentifier.viewId !== allLeadsIndexView.id ||
            existingWithUniversalIdentifier.fieldMetadataId !==
              fieldMetadataId
          ) {
            throw new Error(
              `CRM All Leads table field identifier ${universalIdentifier} is already used by a different view field in workspace ${workspaceId}.`,
            );
          }

          return false;
        }

        return !Object.values(flatViewFieldMaps.byUniversalIdentifier)
          .filter(isDefined)
          .some(
            (viewField) =>
              viewField.viewId === allLeadsIndexView.id &&
              viewField.fieldMetadataId === fieldMetadataId,
          );
      });

    const viewsToCreate = viewDefinitions.filter((definition) => {
      const existingView =
        flatViewMaps.byUniversalIdentifier[
          definition.identifier.universalIdentifier
        ];

      if (isDefined(existingView)) {
        return false;
      }

      const conflictingView = Object.values(
        flatViewMaps.byUniversalIdentifier,
      )
        .filter(isDefined)
        .find(
          (view) =>
            view.objectMetadataId === leadObjectMetadataId &&
            view.name === definition.name &&
            view.type === definition.type,
        );

      if (isDefined(conflictingView)) {
        throw new Error(
          `Cannot create CRM view "${definition.name}" in workspace ${workspaceId}: a view with the same name and type already exists under a different identifier.`,
        );
      }

      return true;
    });

    if (viewsToCreate.length === 0 && tableViewFieldsToCreate.length === 0) {
      this.logger.log(
        doNotTranslate(
          `CRM Lead views and All Leads columns already exist in workspace ${workspaceId}; skipping view creation`,
        ),
      );

      await this.ensureLeadNavigationItems({
        workspaceId,
        leadObjectMetadataId,
        options,
      });

      return;
    }

    if (options.dryRun) {
      this.logger.log(
        doNotTranslate(
          `[DRY RUN] Would create CRM Lead views in workspace ${workspaceId}: ${viewsToCreate.map((view) => view.name).join(', ') || 'none'}; add ${tableViewFieldsToCreate.length} All Leads column(s)`,
        ),
      );

      return;
    }

    const flatViewsToCreate = [];
    const flatViewGroupsToCreate = [];
    const flatViewFieldsToCreate: ReturnType<
      typeof fromCreateViewFieldInputToFlatViewFieldToCreate
    >[] = [];
    let flatViewMapsForCreation = flatViewMaps;

    for (const definition of viewsToCreate) {
      const viewInput = {
        id: definition.identifier.id,
        universalIdentifier: definition.identifier.universalIdentifier,
        name: definition.name,
        objectMetadataId: leadObjectMetadataId,
        type: definition.type,
        icon: definition.icon,
        position: definition.position,
        visibility: ViewVisibility.WORKSPACE,
        ...(definition.type === ViewType.KANBAN
          ? {
              mainGroupByFieldMetadataId:
                definition.mainGroupByFieldMetadataId,
            }
          : {
              calendarLayout: definition.calendarLayout,
              calendarFieldMetadataId: definition.calendarFieldMetadataId,
            }),
      };

      const { flatViewToCreate, flatViewGroupsToCreate: createdGroups } =
        fromCreateViewInputToFlatViewToCreate({
          createViewInput: viewInput,
          flatApplication: workspaceCustomFlatApplication,
          flatFieldMetadataMaps,
          flatObjectMetadataMaps,
        });

      flatViewsToCreate.push(flatViewToCreate);
      flatViewGroupsToCreate.push(...createdGroups);

      flatViewMapsForCreation = {
        ...flatViewMapsForCreation,
        universalIdentifierById: {
          ...flatViewMapsForCreation.universalIdentifierById,
          [flatViewToCreate.id]: flatViewToCreate.universalIdentifier,
        },
      };

      definition.fields.forEach((fieldMetadataId, index) => {
        flatViewFieldsToCreate.push(
          fromCreateViewFieldInputToFlatViewFieldToCreate({
            createViewFieldInput: {
              viewId: flatViewToCreate.id,
              fieldMetadataId,
              isVisible: true,
              size: 180,
              position: index,
              universalIdentifier:
                definition.fieldUniversalIdentifiers[index],
            },
            flatApplication: workspaceCustomFlatApplication,
            flatFieldMetadataMaps,
            flatViewMaps: flatViewMapsForCreation,
            flatViewFieldGroupMaps,
          }),
        );
      });
    }

    tableViewFieldsToCreate.forEach(
      ({ fieldMetadataId, universalIdentifier, position }) => {
        flatViewFieldsToCreate.push(
          fromCreateViewFieldInputToFlatViewFieldToCreate({
            createViewFieldInput: {
              viewId: allLeadsIndexView.id,
              fieldMetadataId,
              isVisible: true,
              size: 180,
              position,
              universalIdentifier,
            },
            flatApplication: workspaceCustomFlatApplication,
            flatFieldMetadataMaps,
            flatViewMaps: flatViewMapsForCreation,
            flatViewFieldGroupMaps,
          }),
        );
      },
    );

    const validateAndBuildResult =
      await this.workspaceMigrationValidateBuildAndRunService.validateBuildAndRunWorkspaceMigration({
        allFlatEntityOperationByMetadataName: {
          view: {
            flatEntityToCreate: flatViewsToCreate,
            flatEntityToDelete: [],
            flatEntityToUpdate: [],
          },
          viewGroup: {
            flatEntityToCreate: flatViewGroupsToCreate,
            flatEntityToDelete: [],
            flatEntityToUpdate: [],
          },
          viewField: {
            flatEntityToCreate: flatViewFieldsToCreate,
            flatEntityToDelete: [],
            flatEntityToUpdate: [],
          },
        },
        workspaceId,
        isSystemBuild: false,
        applicationUniversalIdentifier:
          workspaceCustomFlatApplication.universalIdentifier,
      });

    if (validateAndBuildResult.status === 'fail') {
      throw new WorkspaceMigrationBuilderException(
        validateAndBuildResult,
        'Failed to create the CRM Lead pipeline and follow-up calendar views',
      );
    }

    this.logger.log(
      doNotTranslate(
        `Updated CRM Lead views and All Leads columns in workspace ${workspaceId}: ${viewsToCreate.map((view) => view.name).join(', ') || 'views already existed'}; added ${tableViewFieldsToCreate.length} table column(s)`,
      ),
    );

    await this.ensureLeadNavigationItems({
      workspaceId,
      leadObjectMetadataId,
      options,
    });
  }

  private async ensureLeadNavigationItems({
    workspaceId,
    leadObjectMetadataId,
    options,
  }: {
    workspaceId: string;
    leadObjectMetadataId: string;
    options: ProvisionedWorkspaceCommandOptions;
  }): Promise<void> {
    const {
      flatNavigationMenuItemMaps,
      flatObjectMetadataMaps,
      flatViewMaps,
      flatPageLayoutMaps,
      flatAgentChatChannelMaps,
    } = await this.workspaceCacheService.getOrRecompute(workspaceId, [
      'flatNavigationMenuItemMaps',
      'flatObjectMetadataMaps',
      'flatViewMaps',
      'flatPageLayoutMaps',
      'flatAgentChatChannelMaps',
    ]);

    const optimisticFlatNavigationMenuItemMaps = structuredClone(
      flatNavigationMenuItemMaps,
    );

    const workspaceCustomFlatApplication =
      (
        await this.applicationService.findWorkspaceTwentyStandardAndCustomApplicationOrThrow({
          workspaceId,
        })
      ).workspaceCustomFlatApplication;

    const pipelineView =
      flatViewMaps.byUniversalIdentifier[
        CRM_LEAD_VIEW_IDENTIFIERS.pipeline.universalIdentifier
      ];
    const followUpCalendarView =
      flatViewMaps.byUniversalIdentifier[
        CRM_LEAD_VIEW_IDENTIFIERS.followUpCalendar.universalIdentifier
      ];
    const followUpDayView =
      flatViewMaps.byUniversalIdentifier[
        CRM_LEAD_VIEW_IDENTIFIERS.followUpDay.universalIdentifier
      ];
    const allLeadsIndexView = Object.values(
      flatViewMaps.byUniversalIdentifier,
    )
      .filter(isDefined)
      .find(
        (view) =>
          view.objectMetadataId === leadObjectMetadataId &&
          view.key === ViewKey.INDEX &&
          view.type === ViewType.TABLE,
      );

    if (
      !isDefined(pipelineView) ||
      !isDefined(followUpCalendarView) ||
      !isDefined(followUpDayView) ||
      !isDefined(allLeadsIndexView)
    ) {
      throw new Error(
        `Cannot create CRM navigation for workspace ${workspaceId}: one or more Lead views are missing.`,
      );
    }

    const folderId = CRM_NAVIGATION_MENU_ITEM_IDS.folder;
    const existingFolder =
      optimisticFlatNavigationMenuItemMaps.byUniversalIdentifier[folderId];

    if (
      isDefined(existingFolder) &&
      (existingFolder.type !== NavigationMenuItemType.FOLDER ||
        existingFolder.name !== 'CRM')
    ) {
      throw new Error(
        `CRM navigation folder identifier is already used by a different menu item in workspace ${workspaceId}.`,
      );
    }

    const conflictingFolder = Object.values(
      optimisticFlatNavigationMenuItemMaps.byUniversalIdentifier,
    )
      .filter(isDefined)
      .find(
        (item) =>
          item.type === NavigationMenuItemType.FOLDER &&
          item.name === 'CRM' &&
          item.id !== folderId,
      );

    if (isDefined(conflictingFolder)) {
      throw new Error(
        `Cannot create CRM navigation folder in workspace ${workspaceId}: a different folder named CRM already exists.`,
      );
    }

    const navigationItemsToCreate: ReturnType<
      typeof fromCreateNavigationMenuItemInputToFlatNavigationMenuItemToCreate
    >[] = [];
    const createNavigationItem = (input: {
      id: string;
      type: NavigationMenuItemType;
      name: string;
      icon: string;
      position: number;
      viewId?: string;
      folderId?: string;
    }) => {
      const existing =
        optimisticFlatNavigationMenuItemMaps.byUniversalIdentifier[input.id];

      if (isDefined(existing)) {
        if (
          existing.type !== input.type ||
          existing.name !== input.name ||
          existing.viewId !== (input.viewId ?? null) ||
          existing.folderId !== (input.folderId ?? null)
        ) {
          throw new Error(
            `CRM navigation item "${input.name}" has a conflicting existing identifier in workspace ${workspaceId}.`,
          );
        }

        return;
      }

      const sameNameInFolder =
        optimisticFlatNavigationMenuItemMaps.byUserWorkspaceIdAndFolderId['null']?.[
          input.folderId ?? 'null'
        ]?.find(
          (item) =>
            item.name === input.name && item.type === input.type,
        );

      if (isDefined(sameNameInFolder)) {
        throw new Error(
          `Cannot create CRM navigation item "${input.name}" in workspace ${workspaceId}: an item with the same name already exists in the target folder.`,
        );
      }

      const flatNavigationMenuItem =
        fromCreateNavigationMenuItemInputToFlatNavigationMenuItemToCreate({
          createNavigationMenuItemInput: {
            id: input.id,
            type: input.type,
            name: input.name,
            icon: input.icon,
            position: input.position,
            viewId: input.viewId,
            folderId: input.folderId,
          },
          workspaceId,
          flatApplication: workspaceCustomFlatApplication,
          flatNavigationMenuItemMaps: optimisticFlatNavigationMenuItemMaps,
          flatObjectMetadataMaps,
          flatViewMaps,
          flatPageLayoutMaps,
          flatAgentChatChannelMaps,
        });

      addFlatNavigationMenuItemToMapsAndUpdateIndex({
        flatNavigationMenuItem,
        flatNavigationMenuItemMaps: optimisticFlatNavigationMenuItemMaps,
      });
      navigationItemsToCreate.push(flatNavigationMenuItem);
    };

    if (!isDefined(existingFolder)) {
      const rootItems =
        optimisticFlatNavigationMenuItemMaps.byUserWorkspaceIdAndFolderId['null']?.[
          'null'
        ] ?? [];
      const nextRootPosition =
        rootItems.reduce(
          (max, item) => Math.max(max, item.position),
          -1,
        ) + 1;

      createNavigationItem({
        id: folderId,
        type: NavigationMenuItemType.FOLDER,
        name: 'CRM',
        icon: 'IconTarget',
        position: nextRootPosition,
      });
    }

    createNavigationItem({
      id: CRM_NAVIGATION_MENU_ITEM_IDS.pipeline,
      type: NavigationMenuItemType.VIEW,
      name: 'Lead Pipeline',
      icon: 'IconLayoutKanban',
      position: 0,
      viewId: pipelineView.id,
      folderId,
    });
    createNavigationItem({
      id: CRM_NAVIGATION_MENU_ITEM_IDS.allLeads,
      type: NavigationMenuItemType.VIEW,
      name: 'All Leads',
      icon: 'IconTable',
      position: 1,
      viewId: allLeadsIndexView.id,
      folderId,
    });
    createNavigationItem({
      id: CRM_NAVIGATION_MENU_ITEM_IDS.followUps,
      type: NavigationMenuItemType.VIEW,
      name: 'Follow-ups',
      icon: 'IconCalendarClock',
      position: 2,
      viewId: followUpCalendarView.id,
      folderId,
    });
    createNavigationItem({
      id: CRM_NAVIGATION_MENU_ITEM_IDS.dailyFollowUps,
      type: NavigationMenuItemType.VIEW,
      name: 'Daily Follow-ups',
      icon: 'IconCalendarTime',
      position: 3,
      viewId: followUpDayView.id,
      folderId,
    });

    if (navigationItemsToCreate.length === 0) {
      this.logger.log(
        doNotTranslate(
          `CRM navigation links already exist in workspace ${workspaceId}; skipping`,
        ),
      );

      return;
    }

    if (options.dryRun) {
      this.logger.log(
        doNotTranslate(
          `[DRY RUN] Would create ${navigationItemsToCreate.length} CRM navigation item(s) in workspace ${workspaceId}.`,
        ),
      );

      return;
    }

    const validateAndBuildResult =
      await this.workspaceMigrationValidateBuildAndRunService.validateBuildAndRunWorkspaceMigration({
        allFlatEntityOperationByMetadataName: {
          navigationMenuItem: {
            flatEntityToCreate: navigationItemsToCreate,
            flatEntityToDelete: [],
            flatEntityToUpdate: [],
          },
        },
        workspaceId,
        isSystemBuild: false,
        applicationUniversalIdentifier:
          workspaceCustomFlatApplication.universalIdentifier,
      });

    if (validateAndBuildResult.status === 'fail') {
      throw new WorkspaceMigrationBuilderException(
        validateAndBuildResult,
        'Failed to create CRM navigation menu items',
      );
    }

    this.logger.log(
      doNotTranslate(
        `Created CRM navigation folder and views in workspace ${workspaceId}.`,
      ),
    );
  }
}