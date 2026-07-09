export const APPLICATION_UNIVERSAL_IDENTIFIER =
  '71362820-74b6-42eb-9c50-c0a054334826';

export const DEFAULT_ROLE_UNIVERSAL_IDENTIFIER =
  '94a52363-3d0d-443c-95b5-e4c9800e8d3b';

export const MIGRATION_OBJECT_UNIVERSAL_IDENTIFIER =
  '316b4cbc-049d-41b2-bbc6-d1ee4a176254';

export const MIGRATION_FIELD_UNIVERSAL_IDENTIFIERS = {
  name: 'ee0da0a8-5422-40fd-811f-124188176bee',
  status: 'fe9f3b69-c7ef-4a1d-8d50-02cab49dbb69',
  plan: '6789661f-3aaf-4686-92ec-cac8ba7f9afc',
  totalRecords: 'c8665965-2e54-4eb6-877d-a4aeebffe0bb',
  processedRecords: '27945053-4ced-46b9-9ff8-b07c48137bd4',
  createdRecords: '68b0266d-66f8-4625-9982-0d866b703cd0',
  updatedRecords: '431248e6-050c-4475-a5e3-24bac6def475',
  failedRecords: 'a88ea4bf-3890-4b73-8f61-bdfad488062b',
  startedAt: '75da57bf-99ad-4644-9e26-cab37d1b79ff',
  completedAt: 'ac3dd932-6b31-408e-89a8-900b0f08e5b5',
  heartbeatAt: '811b5a33-772e-407c-a12b-19af84893791',
  lastError: 'f406f4ed-69c1-46f8-80aa-9f7a7044cc6f',
  salesforceOrgId: 'ec75d41c-6e10-46e9-8ca5-8737cd47a69c',
} as const;

export const MIGRATION_STATUS_OPTION_UNIVERSAL_IDENTIFIERS = {
  ready: '40b215c3-fb54-4d70-b65b-f449b9c951ef',
  running: '26bc3baf-eb77-4ac8-9630-9f73cd2f28e0',
  paused: '6b06cffa-8abe-43ad-ba75-60f3c0ed7f27',
  completed: '1b0b8762-e093-4521-869f-4691af069179',
  completedWithErrors: 'f3053360-c701-4d69-9a6c-13284c464140',
  failed: 'd00bb0f4-42bd-4b33-8af5-df35f6c6873e',
  cancelled: '2d60a694-8c63-447d-86ba-2006e6f36f02',
} as const;

export const MIGRATION_ITEM_OBJECT_UNIVERSAL_IDENTIFIER =
  '8c37830d-c32b-4832-abc5-5051707d8832';

export const MIGRATION_ITEM_FIELD_UNIVERSAL_IDENTIFIERS = {
  name: '2a8864e0-1743-46e9-bdd1-7afbeaa9c07d',
  status: '2d7fa426-c244-42cd-8d74-7d23469b2558',
  salesforceObject: '24a503ce-ee3e-4968-92e7-81a67506db93',
  targetObject: '4cf839c0-dc79-4492-a8b3-4398cfc1fcef',
  position: 'd22c472b-9e63-418d-8939-b6a8fcc973a4',
  recordCount: '36b3bf61-6fe9-4b91-a990-3291268c4f60',
  processedCount: 'fd998f55-d652-47cd-a480-2e7b104c6d91',
  createdCount: 'd9476c82-d316-4ec7-b8e7-977a1f940afa',
  updatedCount: 'd6545c79-b215-423d-bb3e-cf1b33758165',
  failedCount: 'd840e513-09bb-474f-ad40-4e8c9695ffb9',
  lastProcessedId: '490d3d53-8113-484a-aeef-63883db6b909',
  batchRetryCount: '12141f16-b12b-441f-9020-96a6d318ed12',
  fieldMapping: '5d0d7bcd-0f2c-4e3a-b502-6891e694f8bb',
  lastError: '11873b95-1732-49b2-9679-b7c87608d65b',
} as const;

export const MIGRATION_ITEM_STATUS_OPTION_UNIVERSAL_IDENTIFIERS = {
  pending: 'f686be74-179f-41e2-b24b-167260202753',
  running: '6fe5ea31-f2dd-4828-b259-15132e907cfd',
  completed: '4ce16298-55af-445e-85b8-3ef470cf5dd9',
  completedWithErrors: '57578268-d67c-4f26-8603-bab71ed77160',
  failed: '5cf7c1e0-45ec-4868-af44-28c47ac83e39',
  skipped: 'bc04a704-64a8-40a9-af76-e3faf4ecd699',
} as const;

export const MIGRATION_ERROR_OBJECT_UNIVERSAL_IDENTIFIER =
  '2e7851b2-0eb2-4ae8-8116-37c97985bb46';

export const MIGRATION_ERROR_FIELD_UNIVERSAL_IDENTIFIERS = {
  name: '47a7bbc6-c19a-41d0-a19a-2acc1f6ef587',
  salesforceObject: 'bab6af12-ae70-47fc-afc7-d08d2b99f8e3',
  salesforceRecordId: '2ef6f510-ae37-485a-aa2c-19e0259ec0a1',
  message: '7d7e928f-8c85-457d-b5db-027c58611658',
  recordData: 'f1469ffe-1e3f-448c-800c-8aa138467674',
} as const;

export const MIGRATION_ON_ITEM_FIELD_UNIVERSAL_IDENTIFIER =
  'd101e627-c94a-4aa5-8565-168e7fe51a60';
export const ITEMS_ON_MIGRATION_FIELD_UNIVERSAL_IDENTIFIER =
  '4b702067-95c8-42d7-8b4e-5363a03f8eac';
export const MIGRATION_ON_ERROR_FIELD_UNIVERSAL_IDENTIFIER =
  'c410b9fb-6631-41f0-8cd3-0f172840f394';
export const ERRORS_ON_MIGRATION_FIELD_UNIVERSAL_IDENTIFIER =
  '198c7b58-bd75-4e7d-80bd-0522838d72c5';

export const SALESFORCE_ID_ON_COMPANY_FIELD_UNIVERSAL_IDENTIFIER =
  '3cf90293-b544-4669-a12e-41685f44a72f';
export const SALESFORCE_ID_ON_PERSON_FIELD_UNIVERSAL_IDENTIFIER =
  '48d0c57d-6755-40a2-91f6-5ff81256fbec';
export const SALESFORCE_ID_ON_OPPORTUNITY_FIELD_UNIVERSAL_IDENTIFIER =
  '062d95d0-8291-46d1-962d-0365740459cb';
export const SALESFORCE_ID_ON_TASK_FIELD_UNIVERSAL_IDENTIFIER =
  '313311a7-d10e-46fc-b7db-10d05af61260';
export const SALESFORCE_ID_ON_NOTE_FIELD_UNIVERSAL_IDENTIFIER =
  '712e8752-99e5-43dd-b9a9-6a053de8b540';
export const SALESFORCE_STAGE_ON_OPPORTUNITY_FIELD_UNIVERSAL_IDENTIFIER =
  '64ed4bd5-f4e9-4f18-9f72-9c446f36ee0a';

export const SALESFORCE_CONNECTION_PROVIDER_UNIVERSAL_IDENTIFIER =
  '42cab0a9-59dd-4a67-88c0-dba15e40dc35';

export const TEST_CONNECTION_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER =
  '56056173-232f-4a66-934f-bd40ce2cd481';
export const ANALYZE_MIGRATION_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER =
  '18a3f033-3137-4ebc-b35f-10d88f2b8799';
export const CONTROL_MIGRATION_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER =
  '01485e25-6c71-4cc2-9771-22e2927edc5f';
export const RUN_MIGRATION_TICK_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER =
  '508cc557-ac96-46b7-8e28-705c72320a4c';
export const WATCH_MIGRATIONS_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER =
  'd162a97b-7708-4b2e-bd8f-f0c976d67c12';

export const MIGRATION_WIZARD_FRONT_COMPONENT_UNIVERSAL_IDENTIFIER =
  'e2b26017-0c51-4a4d-ba44-50f9935ab07b';
export const OPEN_MIGRATION_WIZARD_COMMAND_UNIVERSAL_IDENTIFIER =
  '42319490-bfd1-4238-9e43-217db6dda028';

export const MIGRATIONS_VIEW_UNIVERSAL_IDENTIFIER =
  '19f37ea4-9b6c-4cc1-8415-34142f216b14';
export const MIGRATIONS_VIEW_FIELD_UNIVERSAL_IDENTIFIERS = {
  name: 'df4c47c0-c9c2-4b9b-87b2-4cc5a4ca8703',
  status: '0bfa6aca-dc7d-49e6-bf91-f02976a013f7',
  totalRecords: '4dd20443-beb9-454f-95a6-ee910ea8fa77',
  processedRecords: '04e29c4e-779c-46eb-b3b3-11d25f2948fc',
  createdRecords: 'a9249497-c080-4b1a-b730-91ad6d9c6e5d',
  failedRecords: 'd9492906-1533-4e45-8237-5f8fbfd5e523',
  startedAt: '8add39a4-0670-4d4c-a540-c40e204ee9a1',
  completedAt: 'b0489507-b4e6-41bc-a806-d42b2afadf72',
} as const;

export const MIGRATION_ITEMS_VIEW_UNIVERSAL_IDENTIFIER =
  '5bd4b1a8-8607-4930-945c-b920f61dc297';
export const MIGRATION_ITEMS_VIEW_FIELD_UNIVERSAL_IDENTIFIERS = {
  name: '4e59bc19-119c-4f69-ad01-31e086363f83',
  status: 'ca0e04c5-0415-4c7f-9497-c197ee254f6e',
  salesforceObject: '376da466-951d-455a-9ab9-58f1afacd176',
  targetObject: '0118e0cd-7035-4931-a806-52c4b8d8f6dc',
  recordCount: 'd4601874-c70f-4fcd-9e5f-a71de0e9ac36',
  processedCount: '26037db8-1e49-420f-a248-07cc722600a5',
  createdCount: '1f84517f-6855-45cd-b6fa-b58ec1bcc870',
  updatedCount: 'de712946-8118-46b9-b250-284fec3d4b77',
  failedCount: '9162fb66-8feb-4f55-b586-564454f3df38',
} as const;

export const MIGRATION_ERRORS_VIEW_UNIVERSAL_IDENTIFIER =
  'b1e7df25-a808-433a-8835-0c6d06df69c4';
export const MIGRATION_ERRORS_VIEW_FIELD_UNIVERSAL_IDENTIFIERS = {
  name: '7c20086d-f3b9-4c87-94ca-c9f2cae78f0f',
  salesforceObject: 'aa6ddd9f-c8eb-479a-9a21-ed66cbab9ee7',
  salesforceRecordId: '269fc6de-cd03-4b6d-aa55-46c0cb37b262',
  message: '2f548342-324d-4ebd-af1a-5480099f8a59',
} as const;

export const MIGRATIONS_NAVIGATION_MENU_ITEM_UNIVERSAL_IDENTIFIER =
  'a300e116-8830-4b8b-a893-4bdb15d2ec51';

export const MIGRATION_BATCH_SIZE_APP_VARIABLE_UNIVERSAL_IDENTIFIER =
  '8f2fb8a7-ad93-4845-9327-c8b57b7ea1c3';
export const MIGRATION_ERROR_RECORD_LIMIT_APP_VARIABLE_UNIVERSAL_IDENTIFIER =
  'd0465f58-a7d8-491e-ba69-83ab8dffe4dc';
export const SALESFORCE_API_VERSION_APP_VARIABLE_UNIVERSAL_IDENTIFIER =
  '5c429aee-d0f4-4c6d-b02f-a19faa58a73b';
