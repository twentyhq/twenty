import { css, useTheme } from '@emotion/react';
import styled from '@emotion/styled';

import { dataTypes } from '../../constants/dataTypes';
import { MetadataFieldDataType } from '../../types/ObjectFieldDataType';

const StyledDataType = styled.div<{ value: MetadataFieldDataType }>`
  align-items: center;
  border: 1px solid transparent;
  border-radius: ${({ theme }) => theme.border.radius.sm};
  display: flex;
  font-size: ${({ theme }) => theme.font.size.sm};
  gap: ${({ theme }) => theme.spacing(1)};
  height: 20px;
  padding: 0 ${({ theme }) => theme.spacing(2)};

  ${({ theme, value }) =>
    value === 'RELATION'
      ? css`
          border-color: ${theme.color.purple20};
          color: ${theme.color.purple};
        `
      : ''}
`;

type SettingsObjectFieldDataTypeProps = {
  value: MetadataFieldDataType;
};

export const SettingsObjectFieldDataType = ({
  value,
}: SettingsObjectFieldDataTypeProps) => {
  const theme = useTheme();

  const { label, Icon } = dataTypes?.[value];

  return (
    <StyledDataType value={value}>
      <Icon size={theme.icon.size.sm} />
      {label}
    </StyledDataType>
  );
};
