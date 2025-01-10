import styled from '@emotion/styled';
import { zodResolver } from '@hookform/resolvers/zod';
import { useContext, useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { Key } from 'ts-key-enum';
import { z } from 'zod';

import { BlocklistItem } from '@/accounts/types/BlocklistItem';
import { StyledInput } from '@/object-record/object-filter-dropdown/components/ObjectFilterDropdownFilterSelect';
import { BLOCKLIST_CONTEXT_DROPDOWN_ID } from '@/settings/accounts/constants/BlocklistContextDropdownId';
import { BlocklistContext } from '@/settings/accounts/contexts/BlocklistContext';
import { BlocklistContactLevel } from '@/settings/accounts/types/BlocklistContactLevel';
import { TextInput } from '@/ui/input/components/TextInput';
import { Dropdown } from '@/ui/layout/dropdown/components/Dropdown';
import { DropdownMenuItemsContainer } from '@/ui/layout/dropdown/components/DropdownMenuItemsContainer';
import { IconChevronDown, IconTrash, MenuItemMultiSelect } from 'twenty-ui';
import { isDomain } from '~/utils/is-domain';
import { isDefined } from '~/utils/isDefined';

type SettingsAccountsBlocklistContactRowProps = {
  item?: BlocklistItem;
};

const StyledContainer = styled.div`
  align-items: center;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  gap: ${({ theme }) => theme.spacing(2)};
`;

const StyledLinkContainer = styled.div`
  flex: 1;
`;

const StyledEmptyBox = styled.div`
  width: ${({ theme }) => theme.spacing(8)};
`;

const StyledRemoveButton = styled(IconTrash)`
  color: ${({ theme }) => theme.font.color.light};
  cursor: pointer;
  height: ${({ theme }) => theme.spacing(4)};
  width: ${({ theme }) => theme.spacing(4)};
  margin-left: ${({ theme }) => theme.spacing(2)};
  margin-right: ${({ theme }) => theme.spacing(2)};
`;

const StyledClickableComponent = styled.div`
  align-items: center;
  cursor: pointer;
  display: flex;
  justify-content: space-between;
  position: relative;
`;

const StyledInputButton = styled(TextInput)`
  border: 1px solid ${({ theme }) => theme.border.color.light};
  border-radius: 4px;
  z-index: -1;
`;

const StyledIconChevronDown = styled(IconChevronDown)`
  color: ${({ theme }) => theme.font.color.light};
  position: absolute;
  height: 16px;
  width: 16px;
  right: 8px;
  top: 50%;
  transform: translateY(-50%);
`;

const blocklistLevelDropdownItems: {
  id: BlocklistContactLevel;
  label: string;
}[] = [
  {
    id: BlocklistContactLevel.FROM_TO,
    label: 'From/To',
  },
  {
    id: BlocklistContactLevel.CC,
    label: 'Cc',
  },
  {
    id: BlocklistContactLevel.BCC,
    label: 'Bcc',
  },
];

const computeBlocklistItemHandle = (
  blocklist: BlocklistItem[],
  handle: string,
) => {
  if (!handle) {
    return true;
  }

  return !blocklist.some((item) => item.handle === handle);
};

const validationSchema = (blocklist: BlocklistItem[]) =>
  z
    .object({
      emailOrDomain: z
        .string()
        .trim()
        .email('Invalid email or domain')
        .or(
          z
            .string()
            .refine(
              (value) => value.startsWith('@') && isDomain(value.slice(1)),
              'Invalid email or domain',
            ),
        )
        .refine(
          (value) => computeBlocklistItemHandle(blocklist, value),
          'Email or domain is already in blocklist',
        ),
    })
    .required();

type FormInput = {
  emailOrDomain: string;
};

export const SettingsAccountsBlocklistContactRow = ({
  item,
}: SettingsAccountsBlocklistContactRowProps) => {
  const [dropdownSearchText, setDropdownSearchText] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);
  const [dropdownValue, setDropdownValue] = useState<string>(
    !item?.id
      ? ''
      : !item?.levels ||
          item?.levels.length === blocklistLevelDropdownItems.length
        ? BlocklistContactLevel.ALL
        : item?.levels?.join(', '),
  );
  const {
    blocklist,
    updateBlockedEmail,
    handleBlockedEmailRemove,
    addNewBlockedEmail,
  } = useContext(BlocklistContext);

  const [selectedBlocklistLevels, setSelectedBlocklistLevels] = useState<
    BlocklistContactLevel[]
  >(item?.levels || []);

  const { reset, handleSubmit, control, formState } = useForm<FormInput>({
    mode: 'onSubmit',
    resolver: zodResolver(validationSchema(blocklist)),
    defaultValues: {
      emailOrDomain: '',
    },
  });
  const submit = handleSubmit((data) => {
    addNewBlockedEmail({
      levels: selectedBlocklistLevels,
      handle: data.emailOrDomain,
    } as BlocklistItem);
  });

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === Key.Enter) {
      setSelectedBlocklistLevels([]);
      setDropdownValue('');
      submit();
    }
  };

  const { isSubmitSuccessful } = formState;

  useEffect(() => {
    if (isSubmitSuccessful) {
      reset();
    }
  }, [isSubmitSuccessful, reset]);

  const handleMultiSelectChange = (id: BlocklistContactLevel) => {
    const getNewSelectedBlocklistLevels = (prev: BlocklistContactLevel[]) => {
      if (!prev || !prev.length) {
        return [id];
      }

      if (prev.includes(id)) {
        return prev.filter((item) => item !== id);
      }

      return [...prev, id];
    };

    const newSelectedBlocklistLevels = getNewSelectedBlocklistLevels(
      selectedBlocklistLevels,
    );

    setSelectedBlocklistLevels(newSelectedBlocklistLevels);

    setDropdownValue(
      newSelectedBlocklistLevels.length === blocklistLevelDropdownItems.length
        ? BlocklistContactLevel.ALL
        : newSelectedBlocklistLevels.join(', '),
    );
  };

  const resetDropdownSearchText = () => {
    setDropdownSearchText('');
  };

  const handleOnDropdownClickOutside = () => {
    resetDropdownSearchText();
    if (isDefined(item?.id) && isUpdating) {
      updateBlockedEmail({
        id: item?.id as string,
        handle: item?.handle as string,
        levels: selectedBlocklistLevels,
      } as BlocklistItem);
    }
  };

  return (
    <form onSubmit={submit}>
      <StyledContainer>
        <Dropdown
          dropdownId={
            !item?.id ? BLOCKLIST_CONTEXT_DROPDOWN_ID : (item?.id as string)
          }
          dropdownPlacement="bottom-start"
          dropdownMenuWidth={160}
          dropdownHotkeyScope={{ scope: BLOCKLIST_CONTEXT_DROPDOWN_ID }}
          clickableComponent={
            <StyledClickableComponent>
              <StyledInputButton value={dropdownValue} placeholder="From/To" />
              <StyledIconChevronDown />
            </StyledClickableComponent>
          }
          dropdownComponents={
            <DropdownMenuItemsContainer>
              <StyledInput
                value={dropdownSearchText}
                autoFocus
                placeholder="Search"
                onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                  setDropdownSearchText(event.target.value.toLowerCase());
                }}
              />
              {blocklistLevelDropdownItems
                .filter((item) =>
                  item.label.toLowerCase().includes(dropdownSearchText),
                )
                .map((item) => (
                  <MenuItemMultiSelect
                    key={item.id}
                    onSelectChange={() => handleMultiSelectChange(item.id)}
                    text={item.label}
                    selected={selectedBlocklistLevels.includes(item.id)}
                    className={''}
                  />
                ))}
            </DropdownMenuItemsContainer>
          }
          onClickOutside={handleOnDropdownClickOutside}
          onClose={() =>
            item?.id ? setIsUpdating(false) : resetDropdownSearchText()
          }
          onOpen={() =>
            item?.id ? setIsUpdating(true) : resetDropdownSearchText()
          }
        />
        <StyledLinkContainer>
          <Controller
            name="emailOrDomain"
            control={control}
            render={({ field: { value, onChange }, fieldState: { error } }) => (
              <TextInput
                placeholder="@mydomainname.com"
                value={!item?.id ? value : item?.handle}
                error={error?.message}
                fullWidth
                readOnly={!!item?.id}
                onChange={onChange}
                onKeyDown={handleKeyDown}
              />
            )}
          />
        </StyledLinkContainer>
        {item?.id ? (
          <StyledRemoveButton
            onClick={() => handleBlockedEmailRemove(item.id)}
          />
        ) : (
          <StyledEmptyBox />
        )}
      </StyledContainer>
    </form>
  );
};
