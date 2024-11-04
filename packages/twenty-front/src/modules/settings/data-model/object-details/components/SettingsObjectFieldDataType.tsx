import { css, useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import { IconComponent, IconTwentyStar } from 'twenty-ui';

import { SettingsFieldType } from '@/settings/data-model/types/SettingsFieldType';
import { getSettingsFieldTypeConfig } from '@/settings/data-model/utils/getSettingsFieldTypeConfig';
import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
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
  const navigate = useNavigate();

  const fieldTypeConfig = getSettingsFieldTypeConfig(value);
  const Icon: IconComponent =
    IconFromProps ?? fieldTypeConfig?.Icon ?? IconTwentyStar;
  const label = labelFromProps ?? fieldTypeConfig?.label;

  const StyledIcon = styled(Icon)`
    flex: 1 0 auto;
  `;

  const onClickDataType = useCallback(
    (event: React.MouseEvent<HTMLDivElement>) => {
      if (to !== undefined) {
        event.preventDefault(); // prevents the default navigation behavior of the table row
        event.stopPropagation(); // stops the click from bubbling up to the table row
        navigate(to);
      }
    },
    [navigate, to],
  );

  return (
    <StyledDataType
      to={to}
      value={value}
      onClick={to ? onClickDataType : undefined}
    >
      <StyledIcon size={theme.icon.size.sm} />
      <StyledLabelContainer>{label}</StyledLabelContainer>
    </StyledDataType>
  );
};
