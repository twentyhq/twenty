import { type Meta, type StoryObj } from '@storybook/react-vite';
import { expect, fireEvent, userEvent, waitFor, within } from 'storybook/test';
import { assertIsDefinedOrThrow } from 'twenty-shared/utils';

import { MultipleRecordPickerPlacementStory } from '@/object-record/record-picker/multiple-record-picker/components/__stories__/MultipleRecordPickerPlacementStory';
import { multipleRecordPickerPickableMorphItemsComponentState } from '@/object-record/record-picker/multiple-record-picker/states/multipleRecordPickerPickableMorphItemsComponentState';
import { multipleRecordPickerSearchableObjectMetadataItemsComponentState } from '@/object-record/record-picker/multiple-record-picker/states/multipleRecordPickerSearchableObjectMetadataItemsComponentState';
import { searchRecordStoreFamilyState } from '@/object-record/record-picker/multiple-record-picker/states/searchRecordStoreComponentFamilyState';
import { jotaiStore } from '@/ui/utilities/state/jotai/jotaiStore';
import { MemoryRouterDecorator } from '~/testing/decorators/MemoryRouterDecorator';
import { ObjectMetadataItemsDecorator } from '~/testing/decorators/ObjectMetadataItemsDecorator';
import { ToastDecorator } from '~/testing/decorators/ToastDecorator';
import { graphqlMocks } from '~/testing/graphqlMocks';
import { mockedPersonRecords } from '~/testing/mock-data/generated/data/people/mock-people-data';
import { getMockObjectMetadataItemOrThrow } from '~/testing/utils/getMockObjectMetadataItemOrThrow';

const PERSON_METADATA = getMockObjectMetadataItemOrThrow('person');
const PERSON_RECORDS = mockedPersonRecords.slice(0, 12);
const LAST_RECORD = PERSON_RECORDS[PERSON_RECORDS.length - 1];
const LAST_RECORD_LABEL = `${LAST_RECORD.name.firstName} ${LAST_RECORD.name.lastName}`;
const FOCUS_STEPS_FROM_SEARCH = 3;
const FOCUSED_RECORD =
  PERSON_RECORDS[PERSON_RECORDS.length - FOCUS_STEPS_FROM_SEARCH];
const FOCUSED_RECORD_LABEL = `${FOCUSED_RECORD.name.firstName} ${FOCUSED_RECORD.name.lastName}`;
const ANCHOR_SCROLL_TOP = 320;
const POSITION_TOLERANCE_IN_PIXELS = 2;

const meta: Meta<typeof MultipleRecordPickerPlacementStory> = {
  title: 'UI/RecordPicker/MultipleRecordPicker/Placement',
  component: MultipleRecordPickerPlacementStory,
  decorators: [
    MemoryRouterDecorator,
    ObjectMetadataItemsDecorator,
    ToastDecorator,
  ],
  args: { componentInstanceId: 'multiple-record-picker-placement-story' },
  parameters: { msw: graphqlMocks },
  beforeEach: ({ args }) => {
    const componentStateKey = { instanceId: args.componentInstanceId };

    jotaiStore.set(
      multipleRecordPickerSearchableObjectMetadataItemsComponentState.atomFamily(
        componentStateKey,
      ),
      [PERSON_METADATA],
    );
    jotaiStore.set(
      multipleRecordPickerPickableMorphItemsComponentState.atomFamily(
        componentStateKey,
      ),
      PERSON_RECORDS.map(({ id }) => ({
        recordId: id,
        objectMetadataId: PERSON_METADATA.id,
        isSelected: false,
        isMatchingSearchFilter: true,
      })),
    );

    for (const record of PERSON_RECORDS) {
      jotaiStore.set(searchRecordStoreFamilyState.atomFamily(record.id), {
        recordId: record.id,
        label: `${record.name.firstName} ${record.name.lastName}`,
        objectNameSingular: PERSON_METADATA.nameSingular,
        objectLabelSingular: PERSON_METADATA.labelSingular,
        imageUrl: '',
        tsRank: 0,
        tsRankCD: 0,
        record,
      });
    }
  },
};

export default meta;
type Story = StoryObj<typeof MultipleRecordPickerPlacementStory>;

export const FlipKeepsResultsAndFocus: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const body = within(canvasElement.ownerDocument.body);
    const anchorRegion = await canvas.findByRole('region', {
      name: 'Scrollable record editor',
    });
    const trigger = canvas.getByRole('button', { name: 'Link records' });

    await userEvent.click(trigger);

    const popup = await body.findByRole('dialog', { name: 'Related records' });
    const picker = within(popup);
    const search = picker.getByRole('searchbox');
    const listbox = picker.getByRole('listbox', { name: 'Records' });
    const recordsScroller = listbox.parentElement;
    const focusedOption = picker.getByRole('option', {
      name: FOCUSED_RECORD_LABEL,
    });

    assertIsDefinedOrThrow(recordsScroller);

    await waitFor(() => {
      expect(popup.getBoundingClientRect().bottom).toBeLessThanOrEqual(
        trigger.getBoundingClientRect().top + POSITION_TOLERANCE_IN_PIXELS,
      );
      expect(search).toHaveFocus();
    });
    expect(search.getBoundingClientRect().top).toBeGreaterThanOrEqual(
      recordsScroller.getBoundingClientRect().bottom,
    );

    await userEvent.tab({ shift: true });
    expect(picker.getByRole('button', { name: 'Add New' })).toHaveFocus();
    await userEvent.tab({ shift: true });
    expect(trigger).toHaveFocus();
    expect(popup).toBeVisible();
    await userEvent.tab();
    expect(picker.getByRole('button', { name: 'Add New' })).toHaveFocus();
    await userEvent.tab();
    expect(search).toHaveFocus();

    await userEvent.keyboard('{ArrowUp}'.repeat(FOCUS_STEPS_FROM_SEARCH));
    await waitFor(() => {
      expect(focusedOption).toHaveFocus();
      expect(recordsScroller.scrollTop).toBeGreaterThan(0);
    });

    const resultsScrollTop = recordsScroller.scrollTop;

    anchorRegion.scrollTop = ANCHOR_SCROLL_TOP;
    fireEvent.scroll(anchorRegion);

    await waitFor(() => {
      expect(popup.getBoundingClientRect().top).toBeGreaterThanOrEqual(
        trigger.getBoundingClientRect().bottom - POSITION_TOLERANCE_IN_PIXELS,
      );
    });
    await waitFor(() => {
      expect(picker.getByRole('searchbox')).toBe(search);
      expect(picker.getByRole('listbox', { name: 'Records' })).toBe(listbox);
      expect(picker.getByRole('option', { name: FOCUSED_RECORD_LABEL })).toBe(
        focusedOption,
      );
      expect(focusedOption).toHaveFocus();
      expect(recordsScroller.scrollTop).toBe(resultsScrollTop);
      expect(search.getBoundingClientRect().bottom).toBeLessThanOrEqual(
        recordsScroller.getBoundingClientRect().top,
      );
    });

    await userEvent.keyboard('{End}');
    expect(picker.getByRole('button', { name: 'Add New' })).toHaveFocus();
    await userEvent.keyboard('{ArrowUp}');
    expect(
      picker.getByRole('option', {
        name: LAST_RECORD_LABEL,
      }),
    ).toHaveFocus();

    await userEvent.click(search);
    anchorRegion.scrollTop = 0;
    fireEvent.scroll(anchorRegion);
    await waitFor(() =>
      expect(search.getBoundingClientRect().top).toBeGreaterThanOrEqual(
        recordsScroller.getBoundingClientRect().bottom,
      ),
    );
    expect(search).toHaveFocus();
    await userEvent.tab();
    await waitFor(() => expect(popup).not.toBeInTheDocument());
    expect(
      canvas.getByRole('button', { name: 'Outside picker' }),
    ).toHaveFocus();
  },
};
