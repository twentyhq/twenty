import { useLingui } from '@lingui/react/macro';
import { forwardRef } from 'react';
import { MenuItemSuggestion } from 'twenty-ui/navigation';

import { SlashCommandPicker } from '@/advanced-text-editor/extensions/slash-command/SlashCommandPicker';
import {
  SavedResponseDataSourceProvider,
  useSavedResponseDataSource,
} from '@/advanced-text-editor/extensions/slash-command/data-sources/SavedResponseDataSource';
import {
  type SlashCommandPickerComponentProps,
  type SlashCommandPickerRef,
} from '@/advanced-text-editor/extensions/slash-command/types/SlashCommandPickerComponent';

type SavedResponsePickerItem = {
  id: string;
  label: string;
  body?: string;
  subject?: string | null;
  category?: string | null;
  selectable: boolean;
};

const SavedResponsePickerContent = forwardRef<
  SlashCommandPickerRef,
  SlashCommandPickerComponentProps
>(({ editor, range, onComplete, searchQuery, savedResponseSubject }, ref) => {
  const { t } = useLingui();
  const dataSource = useSavedResponseDataSource();
  const savedResponses = dataSource.getSavedResponses();
  const normalizedSearchQuery = searchQuery.trim().toLowerCase();
  const filteredSavedResponses = savedResponses.filter((savedResponse) =>
    `${savedResponse.name} ${savedResponse.category ?? ''}`
      .toLowerCase()
      .includes(normalizedSearchQuery),
  );

  const items: SavedResponsePickerItem[] = dataSource.loading
    ? [
        {
          id: 'loading',
          label: t`Loading saved responses…`,
          selectable: false,
        },
      ]
    : savedResponses.length === 0
      ? [
          {
            id: 'empty',
            label: t`No Saved Responses yet`,
            category: t`Create one in your workspace settings to use it here.`,
            selectable: false,
          },
        ]
      : filteredSavedResponses.length === 0
        ? [
            {
              id: 'no-match',
              label: t`No Saved Responses match your search`,
              selectable: false,
            },
          ]
        : filteredSavedResponses.map((savedResponse) => ({
            id: savedResponse.id,
            label: savedResponse.name,
            body: savedResponse.body,
            subject: savedResponse.subject,
            category: savedResponse.category,
            selectable: true,
          }));

  const selectItem = (item: SavedResponsePickerItem) => {
    if (!item.selectable) {
      return;
    }

    editor
      .chain()
      .focus()
      .deleteRange(range)
      .insertContent(item.body ?? '')
      .run();

    if (
      savedResponseSubject?.getCurrentSubject().length === 0 &&
      item.subject
    ) {
      savedResponseSubject.setSubject(item.subject);
    }

    onComplete();
  };

  return (
    <SlashCommandPicker
      ref={ref}
      items={items}
      editor={editor}
      range={range}
      getItemKey={(item) => item.id}
      onEscape={onComplete}
      onSelect={selectItem}
      renderItem={(item, isSelected) => (
        <MenuItemSuggestion
          text={item.label}
          contextualText={item.category ?? undefined}
          selected={item.selectable && isSelected}
          onClick={item.selectable ? () => selectItem(item) : undefined}
        />
      )}
    />
  );
});

export const SavedResponsePicker = forwardRef<
  SlashCommandPickerRef,
  SlashCommandPickerComponentProps
>((props, ref) => (
  <SavedResponseDataSourceProvider>
    <SavedResponsePickerContent ref={ref} {...props} />
  </SavedResponseDataSourceProvider>
));
