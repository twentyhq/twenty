import { type Meta, type StoryObj } from '@storybook/react-vite';
import { HttpResponse, graphql } from 'msw';

import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { CUSTOM_WORKSPACE_APPLICATION_MOCK } from '@/object-metadata/hooks/__tests__/constants/CustomWorkspaceApplicationMock.test.constant';
import { SettingsDataModelFieldTimelineActivitySection } from '@/settings/data-model/fields/forms/timeline-activity/components/SettingsDataModelFieldTimelineActivitySection';
import { isAdvancedModeEnabledState } from '@/ui/navigation/navigation-drawer/states/isAdvancedModeEnabledState';
import { jotaiStore } from '@/ui/utilities/state/jotai/jotaiStore';
import { ComponentDecorator } from 'twenty-ui/testing';
import { SnackBarDecorator } from '~/testing/decorators/SnackBarDecorator';
import { mockCurrentWorkspace } from '~/testing/mock-data/users';
import { getTestEnrichedObjectMetadataItemsMock } from '~/testing/utils/getTestEnrichedObjectMetadataItemsMock';

const personObjectMetadataItem = getTestEnrichedObjectMetadataItemsMock().find(
  (objectMetadataItem) => objectMetadataItem.nameSingular === 'person',
);

const companyRelationFieldMetadataItem = personObjectMetadataItem?.fields.find(
  (fieldMetadataItem) => fieldMetadataItem.name === 'company',
);

// The section only offers creation on workspace custom objects.
const customObjectMetadataItem = personObjectMetadataItem
  ? {
      ...personObjectMetadataItem,
      applicationId: CUSTOM_WORKSPACE_APPLICATION_MOCK.id,
    }
  : undefined;

const buildFindManyTimelineActivityTypesHandler = (
  timelineActivityTypes: unknown[],
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

      return <Story />;
    },
    ComponentDecorator,
    SnackBarDecorator,
  ],
  args: {
    fieldMetadataItem: companyRelationFieldMetadataItem,
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
                  companyRelationFieldMetadataItem?.universalIdentifier,
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
