import { css, useTheme } from '@emotion/react';
import styled from '@emotion/styled';

import {
  IconCheck,
  IconLink,
  IconNumbers,
  IconPlug,
  IconSocial,
  IconUserCircle,
} from '@/ui/display/icon';
import { IconComponent } from '@/ui/display/icon/types/IconComponent';

import { ObjectFieldDataType } from '../../types/ObjectFieldDataType';

const StyledDataType = styled.div<{ value: ObjectFieldDataType }>`
  align-items: center;
  border: 1px solid transparent;
  border-radius: ${({ theme }) => theme.border.radius.sm};
  display: flex;
  font-size: ${({ theme }) => theme.font.size.sm};
  gap: ${({ theme }) => theme.spacing(1)};
  height: 20px;
  padding: 0 ${({ theme }) => theme.spacing(2)};

  ${({ theme, value }) =>
    value === 'relation'
      ? css`
          border-color: ${theme.color.purple20};
          color: ${theme.color.purple};
        `
      : ''}
`;

const dataTypes: Record<
  ObjectFieldDataType,
  { label: string; Icon: IconComponent }
> = {
  boolean: { label: 'True/False', Icon: IconCheck },
  number: { label: 'Number', Icon: IconNumbers },
  relation: { label: 'Relation', Icon: IconPlug },
  social: { label: 'Social', Icon: IconSocial },
  teammate: { label: 'Teammate', Icon: IconUserCircle },
  text: { label: 'Text', Icon: IconLink },
};

type SettingsObjectFieldDataTypeProps = {
  value: ObjectFieldDataType;
};

export const SettingsObjectFieldDataType = ({
  value,
}: SettingsObjectFieldDataTypeProps) => {
  const theme = useTheme();
  const { label, Icon } = dataTypes[value];

  return (
    <StyledDataType value={value}>
      <Icon size={theme.icon.size.sm} />
      {label}
    </StyledDataType>
  );
};
