import { NavigationMenuItemType } from 'twenty-shared/types';
import { type NavigationMenuItem } from '~/generated-metadata/graphql';

export const WORKFLOWS_FOLDER_NAME = 'Workflows';
export const WORKFLOWS_INDEX_PATH = '/objects/workflows';

export const CREATE_COMPANY_WHEN_ADDING_A_NEW_PERSON_WORKFLOW_TEMPLATE_LABEL =
  'Create company when adding a new person';

export const CREATE_COMPANY_WHEN_ADDING_A_NEW_PERSON_WORKFLOW_TEMPLATE_PATH =
  '/workflows/create-company-when-adding-a-new-person';

export const CREATE_COMPANY_WHEN_ADDING_A_NEW_PERSON_WORKFLOW_TEMPLATE_ITEM_ID =
  'workflow-template-create-company-when-adding-a-new-person';

export const isWorkflowsFolder = (folderName: string) =>
  folderName === WORKFLOWS_FOLDER_NAME;

export const createCompanyWhenAddingANewPersonWorkflowTemplateNavigationMenuItem =
  (folderId: string): NavigationMenuItem => ({
    id: CREATE_COMPANY_WHEN_ADDING_A_NEW_PERSON_WORKFLOW_TEMPLATE_ITEM_ID,
    userWorkspaceId: null,
    targetRecordId: null,
    targetObjectMetadataId: null,
    viewId: null,
    folderId,
    name: CREATE_COMPANY_WHEN_ADDING_A_NEW_PERSON_WORKFLOW_TEMPLATE_LABEL,
    link: CREATE_COMPANY_WHEN_ADDING_A_NEW_PERSON_WORKFLOW_TEMPLATE_PATH,
    icon: 'IconBuildingSkyscraper',
    color: 'green',
    position: -1,
    applicationId: '00000000-0000-0000-0000-000000000000',
    createdAt: '1970-01-01T00:00:00.000Z',
    updatedAt: '1970-01-01T00:00:00.000Z',
    targetRecordIdentifier: null,
    type: NavigationMenuItemType.LINK,
  });
