import { useContext } from 'react';
import { styled } from '@linaria/react';
import { Link } from 'react-router-dom';

import { type SettingsFieldType } from '@/settings/data-model/types/SettingsFieldType';
import { getSettingsFieldTypeConfig } from '@/settings/data-model/utils/getSettingsFieldTypeConfig';
import { type IconComponent, IconTwentyStar } from 'twenty-ui/display';
import { ThemeContext } from 'twenty-ui/theme';
import { themeCssVariables } from 'twenty-ui/theme-constants';

type SettingsObjectFieldDataTypeProps = {
  to?: string;
  Icon?: IconComponent;
  label?: string;
  labelDetail?: string;
  value: SettingsFieldType;
  onClick?: (event: React.MouseEvent) => void;
};

const StyledDataType = styled.div<{
  value: SettingsFieldType;
  to?: string;
}>`
  align-items: center;
  border: 1px solid transparent;
  border-radius: ${themeCssVariables.border.radius.sm};
  display: flex;
  font-size: ${themeCssVariables.font.size.sm};
  gap: ${themeCssVariables.spacing[2]};
  height: 20px;
  overflow: hidden;
  text-decoration: none;

  user-select: none;

  ${({ to }) =>
    to
      ? `
          cursor: pointer;
          color: ${themeCssVariables.font.color.secondary};
          text-decoration: underline;

          &:hover {
            color: ${themeCssVariables.font.color.primary};
          }
        `
      : ''}
`;

const StyledLabelContainer = styled.div`
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const StyledSpan = styled.span`
  color: ${themeCssVariables.font.color.extraLight};
`;
export const SettingsObjectFieldDataType = ({
  to,
  value,
  Icon: IconFromProps,
  label: labelFromProps,
  labelDetail,
  onClick,
}: SettingsObjectFieldDataTypeProps) => {
  const { theme } = useContext(ThemeContext);

  const fieldTypeConfig = getSettingsFieldTypeConfig(value);
  const Icon: IconComponent =
    IconFromProps ?? fieldTypeConfig?.Icon ?? IconTwentyStar;
  const label = labelFromProps ?? fieldTypeConfig?.label;

  const StyledIcon = styled(Icon)`
    flex: 1 0 auto;
  `;

  return (
    <StyledDataType
      as={to ? Link : 'div'}
      to={to}
      value={value}
      onClick={onClick}
    >
      <StyledIcon size={theme.icon.size.sm} />
      <StyledLabelContainer>
        {label} <StyledSpan>{labelDetail && `· ${labelDetail}`}</StyledSpan>
      </StyledLabelContainer>
    </StyledDataType>
  );
};
