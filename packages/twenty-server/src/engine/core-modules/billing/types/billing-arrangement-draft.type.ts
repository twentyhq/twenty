/* @license Enterprise */

import { type BillingArrangementEntity } from 'src/engine/core-modules/billing/entities/billing-arrangement.entity';
import { type BillingArrangementSettingKey } from 'src/engine/core-modules/billing/types/billing-arrangement-setting-key.type';

export type BillingArrangementDraft = Pick<
  BillingArrangementEntity,
  | 'type'
  | 'label'
  | 'comment'
  | 'startsAt'
  | 'endsAt'
  | BillingArrangementSettingKey
>;
