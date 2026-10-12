import { styled } from '@linaria/react';
import { plural } from '@lingui/core/macro';
import { useLingui } from '@lingui/react/macro';
import { isNonEmptyString } from '@sniptt/guards';
import { useState } from 'react';
import { CoreObjectNameSingular } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { useToast } from 'twenty-ui/components/feedback';
import { IconPlus } from 'twenty-ui/icon';
import { Avatar } from 'twenty-ui/primitives/data-display';
import { themeCssVariables } from 'twenty-ui/theme';

import { CommandMenuItem } from '@/command-menu/components/CommandMenuItem';
import { useCreateOneRecord } from '@/object-record/hooks/useCreateOneRecord';
import { useFindManyRecords } from '@/object-record/hooks/useFindManyRecords';
import { SidePanelGroup } from '@/side-panel/components/SidePanelGroup';
import { SidePanelList } from '@/side-panel/components/SidePanelList';
import { useSidePanelMenu } from '@/side-panel/hooks/useSidePanelMenu';
import { useAddPeopleToMessageList } from '@/side-panel/pages/add-to-message-list/hooks/useAddPeopleToMessageList';
import { addToMessageListPersonFilterComponentState } from '@/side-panel/pages/add-to-message-list/states/addToMessageListPersonFilterComponentState';
import { DropdownMenuSearchInput } from '@/ui/layout/dropdown/components/DropdownMenuSearchInput';
import { SelectableListItem } from '@/ui/layout/selectable-list/components/SelectableListItem';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';

const CREATE_LIST_ITEM_ID = 'create-list';

const StyledSearchContainer = styled.div`
  border-bottom: 1px solid ${themeCssVariables.border.color.light};
  padding: 0 ${themeCssVariables.spacing[2]};
`;

type MessageListOption = {
  id: string;
  name: string;
};

export const SidePanelAddToMessageListPage = () => {
  const { t } = useLingui();
  const addToMessageListPersonFilter = useAtomComponentStateValue(
    addToMessageListPersonFilterComponentState,
  );
  const [search, setSearch] = useState('');
  const trimmedSearch = search.trim();

  const { records: messageLists, loading } = useFindManyRecords({
    objectNameSingular: CoreObjectNameSingular.MessageList,
    filter: isNonEmptyString(trimmedSearch)
      ? { name: { ilike: `%${trimmedSearch}%` } }
      : undefined,
    orderBy: [{ name: 'AscNullsLast' }],
    recordGqlFields: { id: true, name: true },
  });

  const { createOneRecord: createMessageList } = useCreateOneRecord({
    objectNameSingular: CoreObjectNameSingular.MessageList,
  });
  const { addPeopleToMessageList } = useAddPeopleToMessageList();
  const { closeSidePanelMenu } = useSidePanelMenu();
  const { enqueueToast } = useToast();

  if (!isDefined(addToMessageListPersonFilter)) {
    return null;
  }

  const messageListOptions: MessageListOption[] = messageLists.map(
    ({ id, name }) => ({
      id,
      name: isNonEmptyString(name) ? name : t`Untitled list`,
    }),
  );

  const handleAddToList = async ({ id, name }: MessageListOption) => {
    void closeSidePanelMenu();

    try {
      const { addedCount } = await addPeopleToMessageList({
        listId: id,
        personFilter: addToMessageListPersonFilter,
      });

      enqueueToast(
        addedCount > 0
          ? {
              variant: 'success',
              children: plural(addedCount, {
                one: `# person added to ${name}`,
                other: `# people added to ${name}`,
              }),
            }
          : {
              variant: 'info',
              children: t`Everyone is already in ${name}`,
            },
      );
    } catch {
      enqueueToast({
        variant: 'error',
        children: t`Could not add people to ${name}`,
      });
    }
  };

  const handleCreateList = async () => {
    const name = isNonEmptyString(trimmedSearch)
      ? trimmedSearch
      : t`Untitled list`;
    const createdList = await createMessageList({ name });

    if (isDefined(createdList)) {
      await handleAddToList({ id: createdList.id, name });
    }
  };

  return (
    <>
      <StyledSearchContainer>
        <DropdownMenuSearchInput
          value={search}
          placeholder={t`Search lists`}
          onChange={(event) => setSearch(event.target.value)}
        />
      </StyledSearchContainer>
      <SidePanelList
        selectableItemIds={[
          ...messageListOptions.map(({ id }) => id),
          CREATE_LIST_ITEM_ID,
        ]}
        loading={loading}
      >
        {messageListOptions.length > 0 && (
          <SidePanelGroup heading={t`Lists`}>
            {messageListOptions.map((messageList) => (
              <SelectableListItem
                key={messageList.id}
                itemId={messageList.id}
                onEnter={() => handleAddToList(messageList)}
              >
                <CommandMenuItem
                  id={messageList.id}
                  label={messageList.name}
                  onClick={() => handleAddToList(messageList)}
                  Icon={() => (
                    <Avatar
                      shape="square"
                      colorSeed={messageList.id}
                      name={messageList.name}
                    />
                  )}
                />
              </SelectableListItem>
            ))}
          </SidePanelGroup>
        )}
        <SelectableListItem
          itemId={CREATE_LIST_ITEM_ID}
          onEnter={handleCreateList}
        >
          <CommandMenuItem
            id={CREATE_LIST_ITEM_ID}
            Icon={IconPlus}
            label={
              isNonEmptyString(trimmedSearch)
                ? t`Create "${trimmedSearch}"`
                : t`Create list`
            }
            onClick={handleCreateList}
          />
        </SelectableListItem>
      </SidePanelList>
    </>
  );
};
