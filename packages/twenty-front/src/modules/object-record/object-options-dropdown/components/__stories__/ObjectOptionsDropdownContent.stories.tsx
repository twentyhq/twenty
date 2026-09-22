import {
  type Decorator,
  type Meta,
  type StoryObj,
} from '@storybook/react-vite';
import { expect, userEvent, waitFor, within } from 'storybook/test';

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
import { DropdownContent } from '@/ui/layout/dropdown/components/DropdownContent';
import { DropdownComponentInstanceContext } from '@/ui/layout/dropdown/contexts/DropdownComponentInstanceContext';
import { useSetAtomComponentState } from '@/ui/utilities/state/jotai/hooks/useSetAtomComponentState';
import { jotaiStore } from '@/ui/utilities/state/jotai/jotaiStore';
import { ViewComponentInstanceContext } from '@/views/states/contexts/ViewComponentInstanceContext';
import { ViewType } from '@/views/types/ViewType';
import { useEffect, useState } from 'react';
import { MemoryRouter } from 'react-router-dom';
import { ComponentDecorator } from 'twenty-ui/testing';
import { ContextStoreDecorator } from '~/testing/decorators/ContextStoreDecorator';
import { IconsProviderDecorator } from '~/testing/decorators/IconsProviderDecorator';
import { ObjectMetadataItemsDecorator } from '~/testing/decorators/ObjectMetadataItemsDecorator';
import { ToastDecorator } from '~/testing/decorators/ToastDecorator';
import { getTestEnrichedObjectMetadataItemsMock } from '~/testing/utils/getTestEnrichedObjectMetadataItemsMock';
import { setTestObjectMetadataItemsInMetadataStore } from '~/testing/utils/setTestObjectMetadataItemsInMetadataStore';

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
            <DropdownContent>
              <Story />
            </DropdownContent>
          </ObjectOptionsDropdownContext.Provider>
        </DropdownComponentInstanceContext.Provider>
      </RecordIndexContextProvider>
    );
  };

const createStory = (contentId: ObjectOptionsContentId | null): Story => ({
  decorators: [createContentDecorator(contentId)],
});

// The Load limit row only renders on a grouped view, and seeding 25 rather than
// the default 8 keeps the checked-option assertion from passing by accident.
const GroupedViewWithLoadLimitDecorator: Decorator = (Story) => {
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

  return <Story />;
};

export const Default = createStory(null);

export const Layout = createStory('layout');

export const Fields = createStory('fields');

export const HiddenFields = createStory('hiddenFields');

export const RecordGroups = createStory('recordGroups');

export const RecordGroupFields = createStory('recordGroupFields');

export const RecordGroupSort = createStory('recordGroupSort');

export const RecordGroupLoadLimit = createStory('recordGroupLoadLimit');

export const HiddenRecordGroups = createStory('hiddenRecordGroups');

export const RecordGroupLoadLimitSelectionAction: Story = {
  decorators: [
    GroupedViewWithLoadLimitDecorator,
    createContentDecorator('recordGroups'),
  ],
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
