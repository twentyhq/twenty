import { css, useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import { Link } from 'react-router-dom';
import { IconComponent, IconTwentyStar } from 'twenty-ui';

import { SettingsFieldType } from '@/settings/data-model/types/SettingsFieldType';
import { getSettingsFieldTypeConfig } from '@/settings/data-model/utils/getSettingsFieldTypeConfig';
import { FieldMetadataType } from '~/generated-metadata/graphql';

type SettingsObjectFieldDataTypeProps = {
  to?: string;
  Icon?: IconComponent;
  label?: string;
  value: SettingsFieldType;
};

const StyledDataType = styled.div<{
  value: SettingsFieldType;
  to?: string;
}>`
  align-items: center;
  border: 1px solid transparent;
  border-radius: ${({ theme }) => theme.border.radius.sm};
  display: flex;
  font-size: ${({ theme }) => theme.font.size.sm};
  gap: ${({ theme }) => theme.spacing(2)};
  height: 20px;
  overflow: hidden;
  text-decoration: none;

  ${({ to }) =>
    to
      ? css`
          cursor: pointer;
        `
      : ''}

  ${({ value, theme }) =>
    value === FieldMetadataType.Relation
      ? css`
          color: ${theme.font.color.secondary};
          text-decoration: underline;
        `
      : ''}
`;

const StyledLabelContainer = styled.div`
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

export const SettingsObjectFieldDataType = ({
  to,
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
    <StyledDataType as={to ? Link : 'div'} to={to} value={value}>
      <StyledIcon size={theme.icon.size.sm} />
      <StyledLabelContainer>{label}</StyledLabelContainer>
    </StyledDataType>
  );
};
