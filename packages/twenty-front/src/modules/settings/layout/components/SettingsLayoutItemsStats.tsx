import { commandMenuItemsSelector } from '@/command-menu-item/states/commandMenuItemsSelector';
import { frontComponentsSelector } from '@/front-components/states/frontComponentsSelector';
import { navigationMenuItemsSelector } from '@/navigation-menu-item/common/states/navigationMenuItemsSelector';
import { pageLayoutsWithRelationsSelector } from '@/page-layout/states/pageLayoutsWithRelationsSelector';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { viewsSelector } from '@/views/states/selectors/viewsSelector';
import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { Fragment, useContext } from 'react';
import {
  IconAppWindow,
  IconCommand,
  type IconComponent,
  IconLayoutSidebarLeftExpand,
  IconPuzzle,
  IconTable,
} from 'twenty-ui/display';
import { ThemeContext, themeCssVariables } from 'twenty-ui/theme-constants';

type StatRowProps = {
  Icon: IconComponent;
  label: string;
  value: number;
};

const StyledContainer = styled.div`
  background: ${themeCssVariables.background.secondary};
  border: 1px solid ${themeCssVariables.border.color.medium};
  border-radius: ${themeCssVariables.border.radius.md};
  display: flex;
  gap: ${themeCssVariables.spacing[3]};
  padding: ${themeCssVariables.spacing[2]};
`;

const StyledColumn = styled.div`
  display: flex;
  flex: 1 1 0;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[1]};
  min-width: 0;
`;

const StyledDivider = styled.div`
  align-self: stretch;
  background: ${themeCssVariables.border.color.light};
  width: 1px;
`;

const StyledRow = styled.div`
  align-items: center;
  display: flex;
  gap: ${themeCssVariables.spacing[2]};
  height: ${themeCssVariables.spacing[6]};
`;

const StyledLabel = styled.div`
  color: ${themeCssVariables.font.color.tertiary};
  flex: 1 1 0;
  font-size: ${themeCssVariables.font.size.sm};
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const StyledValue = styled.div`
  color: ${themeCssVariables.font.color.primary};
  padding: 0 ${themeCssVariables.spacing[1]};
`;

const StatRow = ({ Icon, label, value }: StatRowProps) => {
  const { theme } = useContext(ThemeContext);

  return (
    <StyledRow>
      <Icon size={theme.icon.size.md} color={theme.font.color.tertiary} />
      <StyledLabel>{label}</StyledLabel>
      <StyledValue>{value}</StyledValue>
    </StyledRow>
  );
};

export const SettingsLayoutItemsStats = () => {
  const { t } = useLingui();

  const commandMenuItems = useAtomStateValue(commandMenuItemsSelector);
  const navigationMenuItems = useAtomStateValue(navigationMenuItemsSelector);
  const views = useAtomStateValue(viewsSelector);
  const pageLayoutsWithRelations = useAtomStateValue(
    pageLayoutsWithRelationsSelector,
  );
  const frontComponents = useAtomStateValue(frontComponentsSelector);

  const columns: StatRowProps[][] = [
    [
      {
        Icon: IconCommand,
        label: t`Commands`,
        value: commandMenuItems.length,
      },
      {
        Icon: IconLayoutSidebarLeftExpand,
        label: t`Sidebar items`,
        value: navigationMenuItems.length,
      },
    ],
    [
      {
        Icon: IconTable,
        label: t`Views`,
        value: views.length,
      },
      {
        Icon: IconAppWindow,
        label: t`Pages`,
        value: pageLayoutsWithRelations.length,
      },
    ],
    [
      {
        Icon: IconPuzzle,
        label: t`Widgets`,
        value: frontComponents.length,
      },
    ],
  ];

  return (
    <StyledContainer>
      {columns.map((column, index) => (
        <Fragment key={index}>
          {index > 0 && <StyledDivider />}
          <StyledColumn>
            {column.map((stat) => (
              <StatRow
                key={stat.label}
                Icon={stat.Icon}
                label={stat.label}
                value={stat.value}
              />
            ))}
          </StyledColumn>
        </Fragment>
      ))}
    </StyledContainer>
  );
};
