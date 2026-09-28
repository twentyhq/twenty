import { SettingsUnsubscribersFilterDropdown } from '@/settings/unsubscribers/components/filter-dropdown/SettingsUnsubscribersFilterDropdown';
import { SETTINGS_UNSUBSCRIBERS_ALL_FILTER } from '@/settings/unsubscribers/constants/SettingsUnsubscribersAllFilter';
import { type Meta, type StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { expect, userEvent, waitFor, within } from 'storybook/test';
import { ComponentDecorator } from 'twenty-ui/testing';
import { UnsubscribeTopicVisibility } from '~/generated-metadata/graphql';

const TOPICS = [
  {
    id: 'topic-newsletter',
    name: 'Newsletter',
    visibility: UnsubscribeTopicVisibility.PUBLIC,
  },
  {
    id: 'topic-untitled',
    name: null,
    visibility: UnsubscribeTopicVisibility.PUBLIC,
  },
];

const FilterExample = () => {
  const [reasonValue, setReasonValue] = useState(
    SETTINGS_UNSUBSCRIBERS_ALL_FILTER,
  );
  const [topicValue, setTopicValue] = useState(
    SETTINGS_UNSUBSCRIBERS_ALL_FILTER,
  );

  return (
    <>
      <SettingsUnsubscribersFilterDropdown
        topics={TOPICS}
        reasonValue={reasonValue}
        topicValue={topicValue}
        onChangeReason={setReasonValue}
        onChangeTopic={setTopicValue}
        onClear={() => {
          setReasonValue(SETTINGS_UNSUBSCRIBERS_ALL_FILTER);
          setTopicValue(SETTINGS_UNSUBSCRIBERS_ALL_FILTER);
        }}
      />
      <p>{`Reason: ${reasonValue}, topic: ${topicValue}`}</p>
    </>
  );
};

const meta: Meta = {
  title: 'Modules/Settings/Unsubscribers/FilterDropdown',
  decorators: [ComponentDecorator],
  render: () => <FilterExample />,
};
export default meta;
type Story = StoryObj;

export const PagesSelectionAndClear: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const body = within(canvasElement.ownerDocument.body);
    const trigger = canvas.getByRole('button', {
      name: 'Filter unsubscribers',
    });

    await userEvent.click(trigger);
    const popup = await body.findByRole('dialog', {
      name: 'Filter unsubscribers',
    });

    expect(
      within(popup).getByRole('button', { name: /Reason.*All reasons/ }),
    ).toBeVisible();
    await userEvent.click(within(popup).getByRole('button', { name: /Topic/ }));
    expect(
      await within(popup).findByRole('button', { name: 'Untitled topic' }),
    ).toBeVisible();
    await userEvent.click(
      within(popup).getByRole('button', { name: 'Newsletter' }),
    );
    await waitFor(() => expect(popup).not.toBeInTheDocument());
    expect(canvas.getByText(/topic: topic-newsletter/)).toBeVisible();

    await userEvent.click(trigger);
    const reopened = await body.findByRole('dialog', {
      name: 'Filter unsubscribers',
    });

    expect(
      within(reopened).getByRole('button', { name: /Topic.*Newsletter/ }),
    ).toBeVisible();
    await userEvent.click(
      within(reopened).getByRole('button', { name: 'Clear filters' }),
    );
    expect(canvas.getByText(/topic: all/)).toBeVisible();
    expect(reopened).toBeVisible();
    expect(
      within(reopened).queryByRole('button', { name: 'Clear filters' }),
    ).not.toBeInTheDocument();

    await userEvent.click(
      within(reopened).getByRole('button', { name: /Reason/ }),
    );
    await userEvent.keyboard('{Escape}');
    await waitFor(() => expect(reopened).not.toBeInTheDocument());
    await waitFor(() => expect(trigger).toHaveFocus());
    await userEvent.click(trigger);
    expect(
      await body.findByRole('button', { name: /Reason.*All reasons/ }),
    ).toBeVisible();
    await userEvent.keyboard('{Escape}');
  },
};
