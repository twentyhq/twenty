import { zodResolver } from '@hookform/resolvers/zod';
import { styled } from '@linaria/react';
import { useEffect } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { Key } from 'ts-key-enum';
import { z } from 'zod';

import { SettingsTextInput } from '@/ui/input/components/SettingsTextInput';
import { Table } from '@/ui/layout/table/components/Table';
import { TableBody } from '@/ui/layout/table/components/TableBody';
import { TableCell } from '@/ui/layout/table/components/TableCell';
import { TableRow } from '@/ui/layout/table/components/TableRow';
import { useLingui } from '@lingui/react/macro';
import {
  IconX,
  OverflowingTextWithTooltip,
} from 'twenty-ui-deprecated/display';
import { Button, IconButton } from 'twenty-ui-deprecated/input';
import { themeCssVariables } from 'twenty-ui-deprecated/theme-constants';

const StyledContainer = styled.div`
  display: flex;
  flex-direction: row;
`;

const StyledInputContainer = styled.div`
  flex: 1;
  margin-right: ${themeCssVariables.spacing[2]};
`;

const StyledTableContainer = styled.div`
  margin-top: ${themeCssVariables.spacing[2]};
`;

const StyledTableBodyContainer = styled.div`
  border-bottom: 1px solid ${themeCssVariables.border.color.light};
`;

type SettingsAccountsCalendarChannelSyncedCategoriesProps = {
  syncedCategories: string[];
  onSyncedCategoriesChange: (syncedCategories: string[]) => void;
};

type FormInput = {
  category: string;
};

export const SettingsAccountsCalendarChannelSyncedCategories = ({
  syncedCategories,
  onSyncedCategoriesChange,
}: SettingsAccountsCalendarChannelSyncedCategoriesProps) => {
  const { t } = useLingui();

  const validationSchema = (syncedCategories: string[]) =>
    z
      .object({
        category: z
          .string()
          .trim()
          .min(1, t`Category cannot be empty`)
          .refine(
            (value) =>
              !syncedCategories.some(
                (category) =>
                  category.trim().toLowerCase() === value.toLowerCase(),
              ),
            t`Category is already in the list`,
          ),
      })
      .required();

  const { reset, handleSubmit, control, formState } = useForm<FormInput>({
    mode: 'onSubmit',
    resolver: zodResolver(validationSchema(syncedCategories)),
    defaultValues: {
      category: '',
    },
  });

  const submit = handleSubmit((data) => {
    onSyncedCategoriesChange([...syncedCategories, data.category]);
  });

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === Key.Enter) {
      // Without this the browser's implicit form submission fires
      // onSubmit as well, submitting twice.
      event.preventDefault();
      submit();
    }
  };

  const handleRemoveCategory = (categoryToRemove: string) => {
    onSyncedCategoriesChange(
      syncedCategories.filter((category) => category !== categoryToRemove),
    );
  };

  const { isSubmitSuccessful } = formState;

  useEffect(() => {
    if (isSubmitSuccessful) {
      reset();
    }
  }, [isSubmitSuccessful, reset]);

  return (
    <>
      <form onSubmit={submit}>
        <StyledContainer>
          <StyledInputContainer>
            <Controller
              name="category"
              control={control}
              render={({
                field: { value, onChange },
                fieldState: { error },
              }) => (
                <SettingsTextInput
                  instanceId="settings-accounts-calendar-synced-categories-input"
                  placeholder={t`Client meeting`}
                  value={value}
                  onChange={onChange}
                  error={error?.message}
                  onKeyDown={handleKeyDown}
                  fullWidth
                />
              )}
            />
          </StyledInputContainer>
          <Button title={t`Add category`} type="submit" />
        </StyledContainer>
      </form>
      {syncedCategories.length > 0 && (
        <StyledTableContainer>
          <Table>
            <StyledTableBodyContainer>
              <TableBody>
                {syncedCategories.map((category) => (
                  <TableRow key={category} gridAutoColumns="1fr 20px">
                    <TableCell>
                      <OverflowingTextWithTooltip text={category} />
                    </TableCell>
                    <TableCell align="right">
                      <IconButton
                        onClick={() => {
                          handleRemoveCategory(category);
                        }}
                        variant="tertiary"
                        size="small"
                        Icon={IconX}
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </StyledTableBodyContainer>
          </Table>
        </StyledTableContainer>
      )}
    </>
  );
};
