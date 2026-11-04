import { pageLayoutDraftComponentState } from '@/page-layout/states/pageLayoutDraftComponentState';
import { recordTableWidgetViewDraftComponentState } from '@/page-layout/states/recordTableWidgetViewDraftComponentState';
import { FIELD_WIDGET_SETTINGS_STORY_DATA } from '@/side-panel/pages/page-layout/components/record-page/__stories__/fieldWidgetSettingsStoryData';
import { FieldWidgetSettingsStory } from '@/side-panel/pages/page-layout/components/record-page/__stories__/FieldWidgetSettingsStory';
import { initializeFieldWidgetSettingsStory } from '@/side-panel/pages/page-layout/components/record-page/__stories__/initializeFieldWidgetSettingsStory';
import { jotaiStore } from '@/ui/utilities/state/jotai/jotaiStore';
import { type Meta, type StoryObj } from '@storybook/react-vite';
import { expect, userEvent, waitFor, within } from 'storybook/test';
import { ComponentDecorator } from 'twenty-ui/testing';
import { FieldDisplayMode, ViewType } from '~/generated-metadata/graphql';
import { MemoryRouterDecorator } from '~/testing/decorators/MemoryRouterDecorator';
import { ObjectMetadataItemsDecorator } from '~/testing/decorators/ObjectMetadataItemsDecorator';
import { ToastDecorator } from '~/testing/decorators/ToastDecorator';
import { getMockFieldMetadataItemOrThrow } from '~/testing/utils/getMockFieldMetadataItemOrThrow';
import { getMockObjectMetadataItemOrThrow } from '~/testing/utils/getMockObjectMetadataItemOrThrow';

const getCurrentWidget = () =>
  jotaiStore.get(
    pageLayoutDraftComponentState.atomFamily({
      instanceId: FIELD_WIDGET_SETTINGS_STORY_DATA.pageLayoutId,
    }),
  ).tabs[0].widgets[0];

const meta: Meta<typeof FieldWidgetSettingsStory> = {
  title: 'Modules/SidePanel/PageLayout/SidePanelRecordPageFieldSettings',
  component: FieldWidgetSettingsStory,
  decorators: [
    ComponentDecorator,
    MemoryRouterDecorator,
    ObjectMetadataItemsDecorator,
    ToastDecorator,
  ],
  parameters: { container: { width: 640, height: 640 } },
  beforeEach: () => initializeFieldWidgetSettingsStory(),
};

export default meta;
type Story = StoryObj<typeof meta>;

export const SearchAndDisplayMode: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const body = within(canvasElement.ownerDocument.body);
    const trigger = await canvas.findByRole('button', { name: /^Field/ });
    const company = getMockObjectMetadataItemOrThrow('company');
    const tagline = getMockFieldMetadataItemOrThrow({
      objectMetadataItem: company,
      fieldName: 'tagline',
    });

    await userEvent.click(trigger);
    const search = await body.findByRole('searchbox', {
      name: 'Search fields',
    });
    await userEvent.type(search, 'tagline');
    await userEvent.keyboard('{Enter}');
    await waitFor(() => {
      expect(getCurrentWidget()).toMatchObject({
        title: tagline.label,
        configuration: {
          fieldMetadataId: tagline.id,
          nestedRelationFieldMetadataId: null,
        },
      });
      expect(trigger).toHaveAttribute('aria-expanded', 'false');
      expect(trigger).toHaveFocus();
    });

    const layoutTrigger = canvas.getByRole('button', { name: /^Layout/ });
    await userEvent.click(layoutTrigger);
    await userEvent.click(await body.findByRole('option', { name: 'Editor' }));
    await waitFor(() => {
      expect(getCurrentWidget().configuration).toMatchObject({
        fieldDisplayMode: FieldDisplayMode.EDITOR,
      });
      expect(layoutTrigger).toHaveAttribute('aria-expanded', 'false');
      expect(layoutTrigger).toHaveFocus();
    });

    await userEvent.click(trigger);
    expect(
      await body.findByRole('searchbox', { name: 'Search fields' }),
    ).toHaveValue('');
    expect(
      body.getByRole('option', { name: 'Tagline', selected: true }),
    ).toBeVisible();
    await userEvent.keyboard('{Escape}');
  },
};

export const NestedFieldBackAndSelection: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const body = within(canvasElement.ownerDocument.body);
    const trigger = await canvas.findByRole('button', { name: /^Field/ });
    const company = getMockObjectMetadataItemOrThrow('company');
    const person = getMockObjectMetadataItemOrThrow('person');
    const opportunity = getMockObjectMetadataItemOrThrow('opportunity');
    const people = getMockFieldMetadataItemOrThrow({
      objectMetadataItem: company,
      fieldName: 'people',
    });
    const opportunities = getMockFieldMetadataItemOrThrow({
      objectMetadataItem: person,
      fieldName: 'pointOfContactForOpportunities',
    });

    await userEvent.click(trigger);
    const search = await body.findByRole('searchbox', {
      name: 'Search fields',
    });
    await userEvent.type(search, 'people');
    const peopleOpener = body.getByRole('button', { name: 'People' });
    await userEvent.click(peopleOpener);
    await userEvent.click(await body.findByRole('button', { name: 'People' }));
    await waitFor(() => expect(peopleOpener).toHaveFocus());
    expect(search).toHaveValue('people');
    await userEvent.click(peopleOpener);
    await userEvent.click(
      await body.findByRole('option', { name: 'Opportunities' }),
    );

    await waitFor(() => {
      expect(getCurrentWidget()).toMatchObject({
        title: 'People → Opportunities',
        configuration: {
          fieldMetadataId: people.id,
          nestedRelationFieldMetadataId: opportunities.id,
          fieldDisplayMode: FieldDisplayMode.TABLE,
        },
      });
      expect(
        jotaiStore.get(
          recordTableWidgetViewDraftComponentState.atomFamily({
            instanceId: FIELD_WIDGET_SETTINGS_STORY_DATA.pageLayoutId,
          }),
        )[FIELD_WIDGET_SETTINGS_STORY_DATA.widgetId].view,
      ).toMatchObject({ objectMetadataId: opportunity.id });
      expect(trigger).toHaveAttribute('aria-expanded', 'false');
      expect(trigger).toHaveFocus();
    });

    await userEvent.click(trigger);
    expect(
      await body.findByRole('searchbox', { name: 'Search fields' }),
    ).toHaveValue('');
    expect(body.getByRole('button', { name: 'People' })).toBeVisible();
    await userEvent.keyboard('{Escape}');
  },
};

export const DisabledEmbeddedLayout: Story = {
  beforeEach: () =>
    initializeFieldWidgetSettingsStory({
      fieldName: 'people',
      fieldDisplayMode: FieldDisplayMode.CARD,
    }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const body = within(canvasElement.ownerDocument.body);
    const trigger = await canvas.findByRole('button', { name: /^Layout/ });

    await userEvent.click(trigger);
    const kanban = await body.findByRole('option', { name: /Kanban/ });
    expect(kanban).toBeDisabled();
    await userEvent.click(kanban);
    expect(getCurrentWidget().configuration).toMatchObject({
      fieldDisplayMode: FieldDisplayMode.CARD,
    });
    expect(trigger).toHaveAttribute('aria-expanded', 'true');
    await userEvent.click(body.getByRole('option', { name: 'List' }));
    await waitFor(() => {
      expect(getCurrentWidget().configuration).toMatchObject({
        fieldDisplayMode: FieldDisplayMode.TABLE,
      });
      expect(
        jotaiStore.get(
          recordTableWidgetViewDraftComponentState.atomFamily({
            instanceId: FIELD_WIDGET_SETTINGS_STORY_DATA.pageLayoutId,
          }),
        )[FIELD_WIDGET_SETTINGS_STORY_DATA.widgetId].view,
      ).toMatchObject({ type: ViewType.LIST_WIDGET });
      expect(trigger).toHaveAttribute('aria-expanded', 'false');
    });
  },
};
