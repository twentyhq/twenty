import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { isDefined } from 'twenty-shared/utils';
import { In, type Repository } from 'typeorm';

import { type AdminPanelWorkspaceBillingArrangementDTO } from 'src/engine/core-modules/admin-panel/dtos/admin-panel-workspace-billing-arrangement.dto';
import { type UserInfoDTO } from 'src/engine/core-modules/admin-panel/dtos/user-lookup.dto';
import { fromBillingArrangementEntityToDto } from 'src/engine/core-modules/admin-panel/utils/from-billing-arrangement-entity-to-dto.util';
import { type BillingArrangementEntity } from 'src/engine/core-modules/billing/entities/billing-arrangement.entity';
import { BillingArrangementService } from 'src/engine/core-modules/billing/services/billing-arrangement.service';
import { UserEntity } from 'src/engine/core-modules/user/user.entity';

@Injectable()
export class AdminPanelBillingArrangementService {
  constructor(
    private readonly billingArrangementService: BillingArrangementService,
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
  ) {}

  async findWorkspaceBillingArrangements(
    workspaceId: string,
  ): Promise<AdminPanelWorkspaceBillingArrangementDTO[]> {
    const arrangements =
      await this.billingArrangementService.findArrangements(workspaceId);
    const operatorsById = await this.findOperatorsById(arrangements);
    const now = new Date();

    return arrangements.map((arrangement) =>
      fromBillingArrangementEntityToDto({ arrangement, now, operatorsById }),
    );
  }

  private async findOperatorsById(
    arrangements: BillingArrangementEntity[],
  ): Promise<Map<string, UserInfoDTO>> {
    const userIds = [
      ...new Set(
        arrangements
          .flatMap(({ grantedByUserId, revokedByUserId }) => [
            grantedByUserId,
            revokedByUserId,
          ])
          .filter(isDefined),
      ),
    ];

    if (userIds.length === 0) {
      return new Map();
    }

    const users = await this.userRepository.find({
      where: { id: In(userIds) },
      withDeleted: true,
    });

    return new Map(
      users.map(({ id, email, firstName, lastName, createdAt }) => [
        id,
        { id, email, firstName, lastName, createdAt },
      ]),
    );
  }
}
