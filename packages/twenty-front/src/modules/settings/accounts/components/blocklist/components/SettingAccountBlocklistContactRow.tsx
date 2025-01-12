import styled from '@emotion/styled';
import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { Key } from 'ts-key-enum';

import { BlocklistItem } from '@/accounts/types/BlocklistItem';
import { currentWorkspaceMemberState } from '@/auth/states/currentWorkspaceMemberState';
import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { useCreateOneRecord } from '@/object-record/hooks/useCreateOneRecord';
import { useDeleteOneRecord } from '@/object-record/hooks/useDeleteOneRecord';
import { useFindManyRecords } from '@/object-record/hooks/useFindManyRecords';
import { useUpdateOneRecord } from '@/object-record/hooks/useUpdateOneRecord';
import { SettingsAccountsBlocklistDropdownComponent } from '@/settings/accounts/components/blocklist/components/SettingAccountsBlocklistDropdownComponent';
import { useValidateForm } from '@/settings/accounts/components/blocklist/hooks/useValidateForm';
import { BLOCKLIST_CONTEXT_DROPDOWN_ID } from '@/settings/accounts/constants/BlocklistContextDropdownId';
import { BLOCKLIST_SCOPE_DROPDOWN_ITEMS } from '@/settings/accounts/constants/BlocklistScopeDropdownItems';
import { BlocklistItemScope } from '@/settings/accounts/types/BlocklistItemScope';
import { TextInput } from '@/ui/input/components/TextInput';
import { Dropdown } from '@/ui/layout/dropdown/components/Dropdown';
import { useRecoilValue } from 'recoil';
import { IconChevronDown, IconTrash } from 'twenty-ui';
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
      : !item?.scopes ||
          item?.scopes.length === BLOCKLIST_SCOPE_DROPDOWN_ITEMS.length
        ? BlocklistItemScope.ALL
        : item?.scopes?.join(', '),
  );

  const [selectedBlocklistScopes, setSelectedBlocklistScopes] = useState<
    BlocklistItemScope[]
  >(item?.scopes || []);

  const { validationSchema } = useValidateForm();

  const currentWorkspaceMember = useRecoilValue(currentWorkspaceMemberState);

  const { records: blocklist } = useFindManyRecords<BlocklistItem>({
    objectNameSingular: CoreObjectNameSingular.Blocklist,
  });

  const { createOneRecord: createBlocklistItem } =
    useCreateOneRecord<BlocklistItem>({
      objectNameSingular: CoreObjectNameSingular.Blocklist,
    });

  const { deleteOneRecord: deleteBlocklistItem } = useDeleteOneRecord({
    objectNameSingular: CoreObjectNameSingular.Blocklist,
  });

  const { updateOneRecord: updateBlocklistEmail } =
    useUpdateOneRecord<BlocklistItem>({
      objectNameSingular: CoreObjectNameSingular.Blocklist,
    });

  const handleBlockedEmailRemove = (id: string) => {
    deleteBlocklistItem(id);
  };

  const addNewBlockedEmail = (contact: BlocklistItem) => {
    createBlocklistItem({
      scopes: contact.scopes,
      handle: contact.handle,
      workspaceMemberId: currentWorkspaceMember?.id,
    });
  };

  const updateBlockedEmail = (contact: BlocklistItem) => {
    updateBlocklistEmail({
      idToUpdate: contact.id,
      updateOneRecordInput: {
        scopes: contact.scopes,
      },
    });
  };

  const { reset, handleSubmit, control, formState } = useForm<FormInput>({
    mode: 'onSubmit',
    resolver: zodResolver(validationSchema(blocklist)),
    defaultValues: {
      emailOrDomain: '',
    },
  });

  const submit = handleSubmit((data) => {
    addNewBlockedEmail({
      scopes: selectedBlocklistScopes,
      handle: data.emailOrDomain,
    } as BlocklistItem);
  });

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === Key.Enter) {
      setSelectedBlocklistScopes([]);
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

  const handleMultiSelectChange = (id: BlocklistItemScope) => {
    const getNewselectedBlocklistScopes = (prev: BlocklistItemScope[]) => {
      if (!prev || !prev.length) {
        return [id];
      }

      if (prev.includes(id)) {
        return prev.filter((item) => item !== id);
      }

      return [...prev, id];
    };

    const newselectedBlocklistScopes = getNewselectedBlocklistScopes(
      selectedBlocklistScopes,
    );

    setSelectedBlocklistScopes(newselectedBlocklistScopes);

    setDropdownValue(
      newselectedBlocklistScopes.length ===
        BLOCKLIST_SCOPE_DROPDOWN_ITEMS.length
        ? BlocklistItemScope.ALL
        : newselectedBlocklistScopes.join(', '),
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
        scopes: selectedBlocklistScopes,
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
              <StyledInputButton
                value={dropdownValue}
                placeholder="From/To"
                readOnly
              />
              <StyledIconChevronDown />
            </StyledClickableComponent>
          }
          dropdownComponents={
            <SettingsAccountsBlocklistDropdownComponent
              handleMultiSelectChange={handleMultiSelectChange}
              selectedBlocklistScopes={selectedBlocklistScopes}
              dropdownSearchText={dropdownSearchText}
              setDropdownSearchText={setDropdownSearchText}
            />
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
