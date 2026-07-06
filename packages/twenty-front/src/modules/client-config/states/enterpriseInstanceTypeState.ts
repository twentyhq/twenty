import { createAtomState } from '@/ui/utilities/state/jotai/utils/createAtomState';
import {
  ENTERPRISE_INSTANCE_TYPE,
  type EnterpriseInstanceType,
} from 'twenty-shared/constants';

export const enterpriseInstanceTypeState =
  createAtomState<EnterpriseInstanceType>({
    key: 'enterpriseInstanceTypeState',
    defaultValue: ENTERPRISE_INSTANCE_TYPE.PRODUCTION,
  });
