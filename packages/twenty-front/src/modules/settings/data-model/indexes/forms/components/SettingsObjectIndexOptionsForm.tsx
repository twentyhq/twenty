import { Select } from '@/ui/input/components/Select';
import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { Controller, useFormContext } from 'react-hook-form';
import { themeCssVariables } from 'twenty-ui-deprecated/theme-constants';
import { IndexType } from '~/generated-metadata/graphql';
import { type SettingsObjectNewIndexFormValues } from '~/pages/settings/data-model/new-index/SettingsObjectNewIndexFormValues';

const StyledContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[4]};
`;

const StyledFieldLabel = styled.div`
  color: ${themeCssVariables.font.color.light};
  font-size: ${themeCssVariables.font.size.xs};
  font-weight: ${themeCssVariables.font.weight.semiBold};
  margin-bottom: ${themeCssVariables.spacing[1]};
`;

export const SettingsObjectIndexOptionsForm = () => {
  const { t } = useLingui();
  const { control } = useFormContext<SettingsObjectNewIndexFormValues>();

  const indexTypeOptions = [
    {
      value: IndexType.BTREE,
      label: t`BTREE (default, good for sorting and equality)`,
    },
    {
      value: IndexType.GIN,
      label: t`GIN (full-text search and JSONB)`,
    },
  ];

  return (
    <StyledContent>
      <div>
        <StyledFieldLabel>{t`Type`}</StyledFieldLabel>
        <Controller
          name="indexType"
          control={control}
          render={({ field: { value, onChange } }) => (
            <Select
              dropdownId="settings-object-new-index-type"
              value={value}
              options={indexTypeOptions}
              onChange={onChange}
              fullWidth
            />
          )}
        />
      </div>
    </StyledContent>
  );
};
