export const LEGACY_WORKFLOW_OBJECT_UNIVERSAL_IDENTIFIERS = [
  '20202020-62be-406c-b9ca-8caa50d51392',
  '20202020-d65d-4ab9-9344-d77bfb376a3d',
  '20202020-3319-4234-a34c-7f3b9d2e4d1f',
] as const;

export const LEGACY_WORKFLOW_RELATION_FIELD_UNIVERSAL_IDENTIFIERS = [
  '20202020-8c57-4e7f-84f5-f373f68e1b82',
  '20202020-2f52-4ba8-8dc4-d0d6adb9578d',
  '7bdf04f6-a598-57b2-b485-5263c25e1257',
  '2da44ef9-dc63-5c9c-a9fb-58933ed03bc2',
  'edbe3ea7-b9ff-5b23-9a81-ef53a190c873',
] as const;

export const CORE_WORKFLOW_COMMAND_MENU_ITEM_UNIVERSAL_IDENTIFIERS = [
  '44f19c85-0fd0-482f-a14e-da513c60b1b3',
  '57f21a06-a17a-47b1-a123-90d90dbdf0b7',
  '4c227f2e-03bb-4a66-9b13-49f263264f4a',
  'f85d552a-87a3-4667-99f7-71b47917539c',
  'e57efc2d-00a2-493a-b76c-f2dabd23a5eb',
  '92781d24-b875-4282-8cdb-d127f04a5c7d',
  '1f3a3cab-161a-4775-af47-11be4d0bf411',
  '91094438-b4c2-46ad-a23b-8af4b23ba514',
  '26f98606-8b6e-42f2-bc97-2cfc4359bada',
  '37745922-ba18-4bea-a1da-8625ad22d233',
] as const;

export const FAVORITE_COMMAND_MENU_ITEM_UNIVERSAL_IDENTIFIERS = [
  '38bf80c3-bd55-4753-80ba-38aa66429a03',
  '3ea42507-44fa-4895-a36d-cbfef7355a50',
] as const;

export const WORKFLOWS_NAVIGATION_MENU_ITEM_UNIVERSAL_IDENTIFIER =
  '20202020-b008-4b08-8b08-c0aba11c0008';

export const CORE_WORKFLOW_CONTEXT_EXPRESSION =
  'objectMetadataItem.nameSingular == "workflow"';

export const LEGACY_WORKFLOW_FAVORITE_EXPRESSION_SUFFIX =
  ' and not (featureFlags.IS_WORKFLOW_CORE_INDEX_PAGE_ENABLED and objectMetadataItem.nameSingular == "workflow")';

export const CORE_WORKFLOW_FAVORITE_EXPRESSION_SUFFIX =
  ' and objectMetadataItem.nameSingular != "workflow"';

export const WORKFLOWS_NAVIGATION_LINK = '/workflows';
