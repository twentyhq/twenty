import { css, useTheme } from '@emotion/react';
import styled from '@emotion/styled';

import { SettingsSupportedFieldType } from '@/settings/data-model/types/SettingsSupportedFieldType';
import { getSettingsFieldTypeConfig } from '@/settings/data-model/utils/getSettingsFieldTypeConfig';
import { IconTwentyStar } from '@/ui/display/icon/components/IconTwentyStar';
import { IconComponent } from '@/ui/display/icon/types/IconComponent';
import { FieldMetadataType } from '~/generated-metadata/graphql';

type SettingsObjectFieldDataTypeProps = {
  onClick?: () => void;
  Icon?: IconComponent;
  label?: string;
  value: SettingsSupportedFieldType;
};

const StyledDataType = styled.div<{ value: SettingsSupportedFieldType }>`
  align-items: center;
  border: 1px solid transparent;
  border-radius: ${({ theme }) => theme.border.radius.sm};
  display: flex;
  font-size: ${({ theme }) => theme.font.size.sm};
  gap: ${({ theme }) => theme.spacing(1)};
  height: 20px;
  overflow: hidden;
  padding: 0 ${({ theme }) => theme.spacing(2)};

  ${({ onClick }) =>
    onClick
      ? css`
          cursor: pointer;
        `
      : ''}

  ${({ theme, value }) =>
    value === FieldMetadataType.Relation
      ? css`
          border-color: ${theme.tag.background.purple};
          color: ${theme.color.purple};
        `
      : ''}
`;

const StyledLabelContainer = styled.div`
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

export const SettingsObjectFieldDataType = ({
  onClick,
  value,
  Icon: IconFromProps,
  label: labelFromProps,
}: SettingsObjectFieldDataTypeProps) => {
  const theme = useTheme();

  const fieldTypeConfig = getSettingsFieldTypeConfig(value);
  const Icon: IconComponent =
    IconFromProps ?? fieldTypeConfig?.Icon ?? IconTwentyStar;
  const label = labelFromProps ?? fieldTypeConfig?.label;

  const StyledIcon = styled(Icon)`
    flex: 1 0 auto;
  `;

  return (
    <StyledDataType onClick={onClick} value={value}>
      <StyledIcon size={theme.icon.size.sm} />
      <StyledLabelContainer>{label}</StyledLabelContainer>
    </StyledDataType>
  );
};
