import { type Meta, type StoryObj } from '@storybook/react-vite';
import { HttpResponse, graphql } from 'msw';

import { currentUserWorkspaceState } from '@/auth/states/currentUserWorkspaceState';
import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { CUSTOM_WORKSPACE_APPLICATION_MOCK } from '@/object-metadata/hooks/__tests__/constants/CustomWorkspaceApplicationMock.test.constant';
import { SettingsDataModelFieldTimelineActivitySection } from '@/settings/data-model/fields/forms/timeline-activity/components/SettingsDataModelFieldTimelineActivitySection';
import { isAdvancedModeEnabledState } from '@/ui/navigation/navigation-drawer/states/isAdvancedModeEnabledState';
import { jotaiStore } from '@/ui/utilities/state/jotai/jotaiStore';
import { ComponentDecorator } from 'twenty-ui/testing';
import {
  type FindManyTimelineActivityTypesQuery,
  PermissionFlagType,
} from '~/generated-metadata/graphql';
import { SnackBarDecorator } from '~/testing/decorators/SnackBarDecorator';
import { RootDecorator } from '~/testing/decorators/RootDecorator';
import { mockCurrentWorkspace } from '~/testing/mock-data/users';
import { getTestEnrichedObjectMetadataItemsMock } from '~/testing/utils/getTestEnrichedObjectMetadataItemsMock';

const personObjectMetadataItem = getTestEnrichedObjectMetadataItemsMock().find(
  (objectMetadataItem) => objectMetadataItem.nameSingular === 'person',
);

const RELATION_FIELD_UNIVERSAL_IDENTIFIER =
  '20202020-0000-0000-0000-000000000010';

const companyRelationFieldMetadataItem = personObjectMetadataItem?.fields.find(
  (fieldMetadataItem) => fieldMetadataItem.name === 'company',
);

const relationFieldMetadataItem = companyRelationFieldMetadataItem
  ? {
      ...companyRelationFieldMetadataItem,
      universalIdentifier: RELATION_FIELD_UNIVERSAL_IDENTIFIER,
    }
  : undefined;

// The section only offers creation on workspace custom objects.
const customObjectMetadataItem = personObjectMetadataItem
  ? {
      ...personObjectMetadataItem,
      applicationId: CUSTOM_WORKSPACE_APPLICATION_MOCK.id,
    }
  : undefined;

type MockedTimelineActivityType =
  FindManyTimelineActivityTypesQuery['timelineActivityTypes'][number] & {
    __typename: 'TimelineActivityType';
  };

const buildFindManyTimelineActivityTypesHandler = (
  timelineActivityTypes: MockedTimelineActivityType[],
) =>
  graphql.query('FindManyTimelineActivityTypes', () => {
    return HttpResponse.json({
      data: {
        timelineActivityTypes,
      },
    });
  });

const meta: Meta<typeof SettingsDataModelFieldTimelineActivitySection> = {
  title:
    'Modules/Settings/DataModel/SettingsDataModelFieldTimelineActivitySection',
  component: SettingsDataModelFieldTimelineActivitySection,
  decorators: [
    (Story) => {
      jotaiStore.set(isAdvancedModeEnabledState.atom, true);
      jotaiStore.set(currentWorkspaceState.atom, mockCurrentWorkspace);
      // The section is hidden without the permission its mutations need.
      jotaiStore.set(currentUserWorkspaceState.atom, {
        permissionFlags: [PermissionFlagType.APPLICATIONS],
        twoFactorAuthenticationMethodSummary: [],
        objectsPermissions: [],
      });

      return <Story />;
    },
    ComponentDecorator,
    SnackBarDecorator,
    RootDecorator,
  ],
  args: {
    fieldMetadataItem: relationFieldMetadataItem,
    objectMetadataItem: customObjectMetadataItem,
  },
};

export default meta;
type Story = StoryObj<typeof SettingsDataModelFieldTimelineActivitySection>;

export const WithCreatableEmitter: Story = {
  parameters: {
    msw: {
      handlers: [buildFindManyTimelineActivityTypesHandler([])],
    },
  },
};

export const WithExistingEmitter: Story = {
  parameters: {
    msw: {
      handlers: [
        buildFindManyTimelineActivityTypesHandler([
          {
            __typename: 'TimelineActivityType',
            id: '20202020-0000-0000-0000-000000000001',
            applicationId: CUSTOM_WORKSPACE_APPLICATION_MOCK.id,
            universalIdentifier: '20202020-0000-0000-0000-000000000002',
            name: 'companyLinked',
            label: 'linked a related person',
            icon: 'IconUser',
            emit: {
              __typename: 'TimelineActivityTypeEmit',
              on: 'linked',
              objectUniversalIdentifier: null,
              through: {
                __typename: 'TimelineActivityTypeEmitThrough',
                relationFieldUniversalIdentifier:
                  RELATION_FIELD_UNIVERSAL_IDENTIFIER,
              },
            },
            frontComponentUniversalIdentifier: null,
            isActive: true,
          },
        ]),
      ],
    },
  },
};
