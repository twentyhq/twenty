import { type Meta, type StoryObj } from '@storybook/react-vite';
import { graphql, HttpResponse } from 'msw';
import { expect, fn, userEvent, waitFor, within } from 'storybook/test';
import { PermissionFlagType } from 'twenty-shared/constants';
import { isDefined, tipTapDocumentToMarkdown } from 'twenty-shared/utils';
import { ComponentDecorator } from 'twenty-ui/testing';

import { aiChatPrepromptState } from '@/ai-chat/states/aiChatPrepromptState';
import { aiModelsState } from '@/client-config/states/aiModelsState';
import { SettingsApplicationSuggestedViewFieldsBanner } from '@/settings/applications/components/SettingsApplicationSuggestedViewFieldsBanner';
import { jotaiStore } from '@/ui/utilities/state/jotai/jotaiStore';
import {
  type DismissApplicationSuggestedViewFieldsMutation,
  type DismissApplicationSuggestedViewFieldsMutationVariables,
  type FindApplicationSuggestedViewFieldsQuery,
  type FindApplicationSuggestedViewFieldsQueryVariables,
} from '~/generated-metadata/graphql';
import { ComponentWithRouterDecorator } from '~/testing/decorators/ComponentWithRouterDecorator';
import { ObjectMetadataItemsDecorator } from '~/testing/decorators/ObjectMetadataItemsDecorator';
import { ToastDecorator } from '~/testing/decorators/ToastDecorator';
import { mockedViews } from '~/testing/mock-data/generated/metadata/views/mock-views-data';
import { mockedUserData } from '~/testing/mock-data/users';
import { getMockObjectMetadataItemOrThrow } from '~/testing/utils/getMockObjectMetadataItemOrThrow';
import { mockedApolloClient } from '~/testing/mockedApolloClient';

const APPLICATION_ID = '20202020-6a7b-4c3d-8e4f-000000000002';
const JOB_TITLE_SUGGESTION_ID = '20202020-6a7b-4c3d-8e4f-000000000003';
const CITY_SUGGESTION_ID = '20202020-6a7b-4c3d-8e4f-000000000004';

const personObjectMetadataItem = getMockObjectMetadataItemOrThrow('person');
const allPeopleView = mockedViews.find(({ name }) => name === 'All People');

const findPersonFieldOrThrow = (name: string) => {
  const field = personObjectMetadataItem.fields.find(
    (personField) => personField.name === name,
  );

  if (!isDefined(field)) {
    throw new Error(`Person field ${name} not found`);
  }

  return field;
};

const jobTitleField = findPersonFieldOrThrow('jobTitle');
const cityField = findPersonFieldOrThrow('city');

const dismissRequest = fn();

const meta: Meta<typeof SettingsApplicationSuggestedViewFieldsBanner> = {
  title:
    'Modules/Settings/Applications/SettingsApplicationSuggestedViewFieldsBanner',
  component: SettingsApplicationSuggestedViewFieldsBanner,
  decorators: [
    ToastDecorator,
    ComponentDecorator,
    ObjectMetadataItemsDecorator,
    ComponentWithRouterDecorator,
  ],
  args: {
    applicationId: APPLICATION_ID,
    applicationName: 'People Data Labs',
  },
  beforeEach: async () => {
    dismissRequest.mockClear();
    jotaiStore.set(aiChatPrepromptState.atom, null);
    jotaiStore.set(aiModelsState.atom, [
      { modelId: 'story-model', label: 'Story model' },
    ]);
    await mockedApolloClient.clearStore();
  },
  parameters: {
    currentUserWorkspace: {
      ...mockedUserData.currentUserWorkspace,
      permissionFlags: [PermissionFlagType.AI],
    },
    msw: {
      handlers: [
        graphql.query<
          FindApplicationSuggestedViewFieldsQuery,
          FindApplicationSuggestedViewFieldsQueryVariables
        >('FindApplicationSuggestedViewFields', () =>
          HttpResponse.json({
            data: {
              applicationSuggestedViewFields: [
                {
                  __typename: 'ApplicationSuggestedViewField',
                  universalIdentifier: CITY_SUGGESTION_ID,
                  viewId: allPeopleView?.id ?? '',
                  objectMetadataId: personObjectMetadataItem.id,
                  fieldMetadataId: cityField.id,
                  position: 1,
                },
                {
                  __typename: 'ApplicationSuggestedViewField',
                  universalIdentifier: JOB_TITLE_SUGGESTION_ID,
                  viewId: allPeopleView?.id ?? '',
                  objectMetadataId: personObjectMetadataItem.id,
                  fieldMetadataId: jobTitleField.id,
                  position: 0,
                },
              ],
            },
          }),
        ),
        graphql.mutation<
          DismissApplicationSuggestedViewFieldsMutation,
          DismissApplicationSuggestedViewFieldsMutationVariables
        >('DismissApplicationSuggestedViewFields', ({ variables }) => {
          dismissRequest(variables);

          return HttpResponse.json({
            data: { dismissApplicationSuggestedViewFields: true },
          });
        }),
      ],
    },
  },
};

export default meta;

type Story = StoryObj<typeof meta>;

const BANNER_TITLE =
  'People Data Labs suggests 2 fields that are not in your views yet.';

export const PrefillsAiChatWithSuggestions: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    expect(await canvas.findByText(BANNER_TITLE)).toBeVisible();

    await userEvent.click(canvas.getByRole('button', { name: 'Set with Ada' }));

    await waitFor(() => {
      expect(jotaiStore.get(aiChatPrepromptState.atom)?.mode).toBe('PREFILL');
    });

    expect(
      tipTapDocumentToMarkdown(
        jotaiStore.get(aiChatPrepromptState.atom)?.serializedDocument ?? '',
      ),
    ).toContain(`• All People: ${jobTitleField.label}, ${cityField.label}`);
    expect(canvas.queryByText(BANNER_TITLE)).not.toBeInTheDocument();
  },
};

export const ListsFieldsWithoutAiAccess: Story = {
  parameters: {
    currentUserWorkspace: {
      ...mockedUserData.currentUserWorkspace,
      permissionFlags: [],
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    expect(await canvas.findByText(BANNER_TITLE)).toBeVisible();
    expect(
      canvas.getByText(
        `All People: ${jobTitleField.label}, ${cityField.label}`,
      ),
    ).toBeVisible();
    expect(
      canvas.getByText('Add them from the Options menu of each view.'),
    ).toBeVisible();
    expect(
      canvas.queryByRole('button', { name: 'Set with Ada' }),
    ).not.toBeInTheDocument();
  },
};

export const DismissesEverySuggestion: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    expect(await canvas.findByText(BANNER_TITLE)).toBeVisible();

    await userEvent.click(canvas.getByRole('button', { name: 'Dismiss' }));

    await waitFor(() => {
      expect(dismissRequest).toHaveBeenCalledWith({
        input: {
          applicationId: APPLICATION_ID,
          universalIdentifiers: [CITY_SUGGESTION_ID, JOB_TITLE_SUGGESTION_ID],
        },
      });
    });
    expect(canvas.queryByText(BANNER_TITLE)).not.toBeInTheDocument();
  },
};
