import { defineObject, FieldType } from 'twenty-sdk';

import {
  CLOUD_USER_2_ACTIVITY_STATUS_FIELD_ID,
  CLOUD_USER_2_AVG_DAILY_PAGEVIEWS_LAST_30D_FIELD_ID,
  CLOUD_USER_2_DATA_LAST_UPDATED_AT_FIELD_ID,
  CLOUD_USER_2_DAYS_SINCE_LAST_ACTIVITY_FIELD_ID,
  CLOUD_USER_2_EMAIL_FIELD_ID,
  CLOUD_USER_2_FULL_NAME_FIELD_ID,
  CLOUD_USER_2_IS_ACTIVE_L24H_FIELD_ID,
  CLOUD_USER_2_IS_ACTIVE_L30D_FIELD_ID,
  CLOUD_USER_2_IS_ACTIVE_L7D_FIELD_ID,
  CLOUD_USER_2_IS_TWENTY_FIELD_ID,
  CLOUD_USER_2_LAST_ACTIVITY_DATE_FIELD_ID,
  CLOUD_USER_2_PAGE_VIEWS_L24H_FIELD_ID,
  CLOUD_USER_2_PAGE_VIEWS_L30D_FIELD_ID,
  CLOUD_USER_2_PAGE_VIEWS_L7D_FIELD_ID,
  CLOUD_USER_2_UPDATED_BY_FIELD_ID,
  CLOUD_USER_2_USER_TENURE_FIELD_ID,
  CLOUD_USER_2_WORKSPACE_COUNT_FIELD_ID,
} from 'src/fields/cloud-user-2-field-ids';

export const CLOUD_USER_2_UNIVERSAL_IDENTIFIER =
  'da264c72-df22-49b3-98e3-21cf6013e671';

export default defineObject({
  universalIdentifier: CLOUD_USER_2_UNIVERSAL_IDENTIFIER,
  nameSingular: 'cloudUser2',
  namePlural: 'cloudUsers2',
  labelSingular: 'Cloud user 2',
  labelPlural: 'Cloud users 2',
  icon: 'IconBox',
  fields: [
    {
      universalIdentifier: CLOUD_USER_2_ACTIVITY_STATUS_FIELD_ID,
      type: FieldType.SELECT,
      name: 'activityStatus',
      label: 'Activity Status',
      options: [
        {
          id: '141d21f3-71b0-4b37-a3d2-5d91d43d0493',
          value: 'ACTIVE',
          label: 'Active',
          position: 0,
          color: 'green',
        },
        {
          id: 'adb1d290-750f-468e-99ee-ed892bcb8974',
          value: 'RECENT',
          label: 'Recent',
          position: 1,
          color: 'blue',
        },
        {
          id: '96f24b75-a671-4727-a78f-5a72419370ea',
          value: 'DORMANT',
          label: 'Dormant',
          position: 2,
          color: 'orange',
        },
        {
          id: '88ddbef9-16a8-4643-9726-5b271cd477fa',
          value: 'INACTIVE',
          label: 'Inactive',
          position: 3,
          color: 'blue',
        },
      ],
    },
    {
      universalIdentifier: CLOUD_USER_2_AVG_DAILY_PAGEVIEWS_LAST_30D_FIELD_ID,
      type: FieldType.NUMBER,
      name: 'avgDailyPageviewsLast30d',
      label: 'Avg Daily Page Views',
    },
    {
      universalIdentifier: CLOUD_USER_2_DATA_LAST_UPDATED_AT_FIELD_ID,
      type: FieldType.DATE_TIME,
      name: 'dataLastUpdatedAt',
      label: 'Data last updated at',
    },
    {
      universalIdentifier: CLOUD_USER_2_DAYS_SINCE_LAST_ACTIVITY_FIELD_ID,
      type: FieldType.NUMBER,
      name: 'daysSinceLastActivity',
      label: 'Days Since Last Activity',
    },
    {
      universalIdentifier: CLOUD_USER_2_EMAIL_FIELD_ID,
      type: FieldType.EMAILS,
      name: 'email',
      label: 'Email',
    },
    {
      universalIdentifier: CLOUD_USER_2_FULL_NAME_FIELD_ID,
      type: FieldType.FULL_NAME,
      name: 'fullName',
      label: 'Full Name',
    },
    {
      universalIdentifier: CLOUD_USER_2_IS_ACTIVE_L24H_FIELD_ID,
      type: FieldType.BOOLEAN,
      name: 'isActiveL24h',
      label: 'Is Active L24H',
      defaultValue: true
    },
    {
      universalIdentifier: CLOUD_USER_2_IS_ACTIVE_L30D_FIELD_ID,
      type: FieldType.BOOLEAN,
      name: 'isActiveL30d',
      label: 'Is Active L30D',
      defaultValue: false
    },
    {
      universalIdentifier: CLOUD_USER_2_IS_ACTIVE_L7D_FIELD_ID,
      type: FieldType.BOOLEAN,
      name: 'isActiveL7d',
      label: 'Is Active L7D',
      defaultValue: true
    },
    {
      universalIdentifier: CLOUD_USER_2_IS_TWENTY_FIELD_ID,
      type: FieldType.BOOLEAN,
      name: 'isTwenty',
      label: 'Is Twenty',
      defaultValue: false
    },
    {
      universalIdentifier: CLOUD_USER_2_LAST_ACTIVITY_DATE_FIELD_ID,
      type: FieldType.DATE_TIME,
      name: 'lastActivityDate',
      label: 'Last Activity Date',
    },
    {
      universalIdentifier: CLOUD_USER_2_PAGE_VIEWS_L24H_FIELD_ID,
      type: FieldType.NUMBER,
      name: 'pageViewsL24h',
      label: 'Page Views L24H',
    },
    {
      universalIdentifier: CLOUD_USER_2_PAGE_VIEWS_L30D_FIELD_ID,
      type: FieldType.NUMBER,
      name: 'pageViewsL30d',
      label: 'Page Views L30D',
    },
    {
      universalIdentifier: CLOUD_USER_2_PAGE_VIEWS_L7D_FIELD_ID,
      type: FieldType.NUMBER,
      name: 'pageViewsL7d',
      label: 'Page Views L7D',
    },
    {
      universalIdentifier: CLOUD_USER_2_UPDATED_BY_FIELD_ID,
      type: FieldType.ACTOR,
      name: 'updatedBy',
      label: 'Updated by',
    },
    {
      universalIdentifier: CLOUD_USER_2_USER_TENURE_FIELD_ID,
      type: FieldType.NUMBER,
      name: 'userTenure',
      label: 'User tenure',
    },
    {
      universalIdentifier: CLOUD_USER_2_WORKSPACE_COUNT_FIELD_ID,
      type: FieldType.NUMBER,
      name: 'workspaceCount',
      label: 'Workspace count',
    },
  ],
});
