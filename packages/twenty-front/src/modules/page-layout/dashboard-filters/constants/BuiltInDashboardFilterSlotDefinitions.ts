import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { BUILT_IN_DASHBOARD_FILTER_SLOT_IDS } from '@/page-layout/dashboard-filters/constants/BuiltInDashboardFilterSlotIds';
import { type DashboardFilterSlotDefinition } from '@/page-layout/dashboard-filters/types/DashboardFilterSlotDefinition';
import { pickBuiltInDateField } from '@/page-layout/dashboard-filters/utils/pickBuiltInDateField';
import { pickBuiltInOwnerField } from '@/page-layout/dashboard-filters/utils/pickBuiltInOwnerField';
import { msg } from '@lingui/core/macro';

export const BUILT_IN_DASHBOARD_FILTER_SLOT_DEFINITIONS: {
  slot: DashboardFilterSlotDefinition;
  pickField: (fields: FieldMetadataItem[]) => FieldMetadataItem | undefined;
}[] = [
  {
    slot: {
      id: BUILT_IN_DASHBOARD_FILTER_SLOT_IDS.DATE,
      label: msg`Date`,
      filterType: 'DATE_TIME',
    },
    pickField: pickBuiltInDateField,
  },
  {
    slot: {
      id: BUILT_IN_DASHBOARD_FILTER_SLOT_IDS.OWNER,
      label: msg`Owner`,
      filterType: 'RELATION',
    },
    pickField: pickBuiltInOwnerField,
  },
];
