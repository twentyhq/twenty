import { css, useTheme } from '@emotion/react';
import styled from '@emotion/styled';

import {
  IconCheck,
  IconLink,
  IconNumbers,
  IconPlug,
  IconSocial,
  IconUserCircle,
} from '@/ui/icon';
import { IconComponent } from '@/ui/icon/types/IconComponent';

import { ObjectFieldItem } from '../types/ObjectFieldItem';

type ObjectFieldDataTypeProps = {
  value: ObjectFieldItem['dataType'];
};

const StyledDataType = styled.div<{ value: ObjectFieldItem['dataType'] }>`
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
  ObjectFieldItem['dataType'],
  { label: string; Icon: IconComponent }
> = {
  boolean: { label: 'True/False', Icon: IconCheck },
  number: { label: 'Number', Icon: IconNumbers },
  relation: { label: 'Relation', Icon: IconPlug },
  social: { label: 'Social', Icon: IconSocial },
  teammate: { label: 'Teammate', Icon: IconUserCircle },
  text: { label: 'Text', Icon: IconLink },
};

export const ObjectFieldDataType = ({ value }: ObjectFieldDataTypeProps) => {
  const theme = useTheme();
  const { label, Icon } = dataTypes[value];

  return (
    <StyledDataType value={value}>
      <Icon size={theme.icon.size.sm} />
      {label}
    </StyledDataType>
  );
};
