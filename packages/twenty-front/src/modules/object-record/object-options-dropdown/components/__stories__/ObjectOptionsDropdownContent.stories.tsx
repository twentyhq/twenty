import {
  type Decorator,
  type Meta,
  type StoryObj,
} from '@storybook/react-vite';
import { graphql, HttpResponse } from 'msw';
import { expect, userEvent, waitFor, within } from 'storybook/test';

import { MAIN_CONTEXT_STORE_INSTANCE_ID } from '@/context-store/constants/MainContextStoreInstanceId';
import { contextStoreCurrentViewIdComponentState } from '@/context-store/states/contextStoreCurrentViewIdComponentState';
import { RecordComponentInstanceContextsWrapper } from '@/object-record/components/RecordComponentInstanceContextsWrapper';
import { ObjectOptionsDropdownContent } from '@/object-record/object-options-dropdown/components/ObjectOptionsDropdownContent';
import { OBJECT_OPTIONS_DROPDOWN_ID } from '@/object-record/object-options-dropdown/constants/ObjectOptionsDropdownId';
import { ObjectOptionsDropdownContext } from '@/object-record/object-options-dropdown/states/contexts/ObjectOptionsDropdownContext';
import { type ObjectOptionsContentId } from '@/object-record/object-options-dropdown/types/ObjectOptionsContentId';
import { RecordIndexContextProvider } from '@/object-record/record-index/contexts/RecordIndexContext';
import { useRecordIndexFieldMetadataDerivedStates } from '@/object-record/record-index/hooks/useRecordIndexFieldMetadataDerivedStates';
import { recordIndexGroupFieldMetadataItemComponentState } from '@/object-record/record-index/states/recordIndexGroupFieldMetadataComponentState';
import { recordIndexGroupLoadLimitComponentState } from '@/object-record/record-index/states/recordIndexGroupLoadLimitComponentState';
import { RecordTableComponentInstanceContext } from '@/object-record/record-table/states/context/RecordTableComponentInstanceContext';
import { LegacyDropdownContent } from '@/ui/layout/dropdown/components/LegacyDropdownContent';
import { DropdownComponentInstanceContext } from '@/ui/layout/dropdown/contexts/DropdownComponentInstanceContext';
import { useSetAtomComponentState } from '@/ui/utilities/state/jotai/hooks/useSetAtomComponentState';
import { jotaiStore } from '@/ui/utilities/state/jotai/jotaiStore';
import { ViewComponentInstanceContext } from '@/views/states/contexts/ViewComponentInstanceContext';
import { ViewType } from '@/views/types/ViewType';
import { type ViewWithRelations } from '@/views/types/ViewWithRelations';
import { useEffect, useState } from 'react';
import { MemoryRouter } from 'react-router-dom';
import { ComponentDecorator } from 'twenty-ui/testing';
import { ViewVisibility } from '~/generated-metadata/graphql';
import { ContextStoreDecorator } from '~/testing/decorators/ContextStoreDecorator';
import { IconsProviderDecorator } from '~/testing/decorators/IconsProviderDecorator';
import { ObjectMetadataItemsDecorator } from '~/testing/decorators/ObjectMetadataItemsDecorator';
import { ToastDecorator } from '~/testing/decorators/ToastDecorator';
import { mockedViews } from '~/testing/mock-data/generated/metadata/views/mock-views-data';
import { getTestEnrichedObjectMetadataItemsMock } from '~/testing/utils/getTestEnrichedObjectMetadataItemsMock';
import { setTestObjectMetadataItemsInMetadataStore } from '~/testing/utils/setTestObjectMetadataItemsInMetadataStore';
import { setTestViewsInMetadataStore } from '~/testing/utils/setTestViewsInMetadataStore';

const instanceId = 'entity-options-instance';

const meta: Meta<typeof ObjectOptionsDropdownContent> = {
  title:
    'Modules/ObjectRecord/ObjectOptionsDropdown/ObjectOptionsDropdownContent',
  component: ObjectOptionsDropdownContent,
  decorators: [
    (Story) => {
      useEffect(() => {
        setTestObjectMetadataItemsInMetadataStore(
          jotaiStore,
          getTestEnrichedObjectMetadataItemsMock(),
        );
      }, []);

      return (
        <RecordComponentInstanceContextsWrapper
          componentInstanceId={instanceId}
        >
          <RecordTableComponentInstanceContext.Provider value={{ instanceId }}>
            <ViewComponentInstanceContext.Provider value={{ instanceId }}>
              <MemoryRouter
                initialEntries={['/one', '/two', { pathname: '/three' }]}
                initialIndex={1}
              >
                <Story />
              </MemoryRouter>
            </ViewComponentInstanceContext.Provider>
          </RecordTableComponentInstanceContext.Provider>
        </RecordComponentInstanceContextsWrapper>
      );
    },
    ContextStoreDecorator,
    ObjectMetadataItemsDecorator,
    ToastDecorator,
    ComponentDecorator,
    IconsProviderDecorator,
  ],
  parameters: {
    layout: 'centered',
  },
};

export default meta;
type Story = StoryObj<typeof ObjectOptionsDropdownContent>;

const createContentDecorator =
  (initialContentId: ObjectOptionsContentId | null): Decorator =>
  (Story) => {
    const [currentContentId, setCurrentContentId] = useState(initialContentId);

    const companyObjectMetadataItem =
      getTestEnrichedObjectMetadataItemsMock().find(
        (item) => item.nameSingular === 'company',
      )!;

    const {
      fieldDefinitionByFieldMetadataItemId,
      fieldMetadataItemByFieldMetadataItemId,
      labelIdentifierFieldMetadataItem,
      recordFieldByFieldMetadataItemId,
    } = useRecordIndexFieldMetadataDerivedStates(
      companyObjectMetadataItem,
      instanceId,
    );

    return (
      <RecordIndexContextProvider
        value={{
          objectPermissionsByObjectMetadataId: {},
          indexIdentifierUrl: () => '',
          onIndexRecordsLoaded: () => {},
          objectNamePlural: 'companies',
          objectNameSingular: 'company',
          objectMetadataItem: companyObjectMetadataItem,
          recordIndexId: instanceId,
          viewBarInstanceId: instanceId,
          fieldDefinitionByFieldMetadataItemId,
          fieldMetadataItemByFieldMetadataItemId,
          labelIdentifierFieldMetadataItem,
          recordFieldByFieldMetadataItemId,
        }}
      >
        <DropdownComponentInstanceContext.Provider
          value={{ instanceId: OBJECT_OPTIONS_DROPDOWN_ID }}
        >
          <ObjectOptionsDropdownContext.Provider
            value={{
              viewType: ViewType.TABLE,
              objectMetadataItem: companyObjectMetadataItem,
              recordIndexId: instanceId,
              currentContentId,
              onContentChange: setCurrentContentId,
              resetContent: () => setCurrentContentId(null),
              dropdownId: OBJECT_OPTIONS_DROPDOWN_ID,
            }}
          >
            <LegacyDropdownContent>
              <Story />
            </LegacyDropdownContent>
          </ObjectOptionsDropdownContext.Provider>
        </DropdownComponentInstanceContext.Provider>
      </RecordIndexContextProvider>
    );
  };

const createStory = (contentId: ObjectOptionsContentId | null): Story => ({
  decorators: [createContentDecorator(contentId)],
});

// Unlisted since the mocked user lacks the VIEWS permission, and not the
// index view, which hides the Group by and Sort rows
const SAVABLE_VIEW: ViewWithRelations = {
  ...mockedViews.find((view) => view.name === 'All Companies')!,
  key: null,
  visibility: ViewVisibility.UNLISTED,
};

const SavableCurrentViewDecorator: Decorator = (Story) => {
  const setContextStoreCurrentViewId = useSetAtomComponentState(
    contextStoreCurrentViewIdComponentState,
    MAIN_CONTEXT_STORE_INSTANCE_ID,
  );

  useEffect(() => {
    setTestViewsInMetadataStore(jotaiStore, [SAVABLE_VIEW]);
    setContextStoreCurrentViewId(SAVABLE_VIEW.id);
  }, [setContextStoreCurrentViewId]);

  return <Story />;
};

// The Load limit row only renders on a grouped view, and seeding 25 rather than
// the default 8 keeps the checked-option assertion from passing by accident.
const GroupedViewWithLoadLimitSetterEffect = () => {
  const groupByFieldMetadataItem = getTestEnrichedObjectMetadataItemsMock()
    .find((item) => item.nameSingular === 'company')!
    .fields.find((field) => field.name === 'idealCustomerProfile');

  const setRecordIndexGroupFieldMetadataItem = useSetAtomComponentState(
    recordIndexGroupFieldMetadataItemComponentState,
    instanceId,
  );

  const setRecordIndexGroupLoadLimit = useSetAtomComponentState(
    recordIndexGroupLoadLimitComponentState,
    instanceId,
  );

  useEffect(() => {
    setRecordIndexGroupFieldMetadataItem(groupByFieldMetadataItem);
    setRecordIndexGroupLoadLimit(25);
  }, [
    groupByFieldMetadataItem,
    setRecordIndexGroupFieldMetadataItem,
    setRecordIndexGroupLoadLimit,
  ]);

  return null;
};

const GroupedViewWithLoadLimitDecorator: Decorator = (Story) => (
  <>
    <GroupedViewWithLoadLimitSetterEffect />
    <Story />
  </>
);

export const Default = createStory(null);

export const Layout = createStory('layout');

export const Fields = createStory('fields');

export const HiddenFields = createStory('hiddenFields');

export const RecordGroups: Story = {
  decorators: [
    SavableCurrentViewDecorator,
    createContentDecorator('recordGroups'),
  ],
};

export const RecordGroupFields = createStory('recordGroupFields');

export const RecordGroupSort = createStory('recordGroupSort');

export const RecordGroupLoadLimit = createStory('recordGroupLoadLimit');

export const HiddenRecordGroups = createStory('hiddenRecordGroups');

export const RecordGroupLoadLimitSelectionAction: Story = {
  decorators: [
    GroupedViewWithLoadLimitDecorator,
    SavableCurrentViewDecorator,
    createContentDecorator('recordGroups'),
  ],
  parameters: {
    msw: {
      handlers: [
        graphql.mutation('UpdateView', ({ variables }) =>
          HttpResponse.json({
            data: { updateView: { ...SAVABLE_VIEW, ...variables.input } },
          }),
        ),
      ],
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await userEvent.click(await canvas.findByText('Load limit'));

    const loadLimitOptions = await canvas.findAllByRole('option');

    expect(loadLimitOptions.map((option) => option.textContent)).toEqual([
      '8',
      '25',
      '50',
      '100',
    ]);

    expect(canvas.getByRole('option', { name: '25' })).toHaveAttribute(
      'aria-selected',
      'true',
    );
    expect(canvas.getByRole('option', { name: '8' })).toHaveAttribute(
      'aria-selected',
      'false',
    );

    await userEvent.click(canvas.getByRole('option', { name: '50' }));

    await waitFor(() => {
      expect(canvas.getByRole('option', { name: '50' })).toHaveAttribute(
        'aria-selected',
        'true',
      );
    });
    expect(canvas.getByRole('option', { name: '25' })).toHaveAttribute(
      'aria-selected',
      'false',
    );

    await userEvent.click(canvas.getByRole('button', { name: 'Go back' }));

    expect(await canvas.findByText('Load limit')).toBeInTheDocument();
    expect(canvas.getByText('50')).toBeInTheDocument();
  },
};

export const FieldsSearchVisibilityAction: Story = {
  ...createStory('fields'),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await userEvent.type(
      await canvas.findByPlaceholderText('Search fields'),
      'address',
    );

    const row = await canvas.findByText('Address');
    const toggle = await canvas.findByRole('button', {
      name: /^(Show|Hide) field$/,
    });
    const initialLabel = toggle.getAttribute('aria-label');

    await userEvent.click(row);

    expect(
      canvas.getByRole('button', { name: initialLabel as string }),
    ).toBeInTheDocument();

    await userEvent.hover(row);
    await userEvent.click(toggle);

    const toggledLabel =
      initialLabel === 'Show field' ? 'Hide field' : 'Show field';

    await waitFor(() => {
      expect(
        canvas.getByRole('button', { name: toggledLabel }),
      ).toBeInTheDocument();
    });
  },
};
