import { ListItemIconContainer } from '@/ui/navigation/list-item/components/ListItemIconContainer';
import { useNavigateToMoreWidgets } from '@/page-layout/hooks/useNavigateToMoreWidgets';
import { type WidgetInsertionContext } from '@/page-layout/states/widgetInsertionContextComponentState';
import { styled } from '@linaria/react';
import { ListItemButton } from 'twenty-ui/components/navigation';
import { IconPlus } from 'twenty-ui/icon';
import { themeCssVariables, useTheme } from 'twenty-ui/theme';
import { useLingui } from '@lingui/react/macro';

const StyledContainer = styled.div`
  box-sizing: border-box;
  padding: ${themeCssVariables.spacing[2]};
  width: 100%;
`;

const StyledMenuItemList = styled.div`
  background-color: ${themeCssVariables.background.secondary};
  border: 1px solid ${themeCssVariables.border.color.medium};
  border-radius: ${themeCssVariables.border.radius.md};
  overflow: hidden;
  padding: ${themeCssVariables.spacing[2]};
`;

type RecordPageAddWidgetSectionProps = {
  insertionContext?: WidgetInsertionContext;
};

export const RecordPageAddWidgetSection = ({
  insertionContext = null,
}: RecordPageAddWidgetSectionProps) => {
  const { t } = useLingui();
  const theme = useTheme();

  const { navigateToMoreWidgets } = useNavigateToMoreWidgets();

  return (
    <StyledContainer>
      <StyledMenuItemList>
        <ListItemButton
          startIcon={
            <ListItemIconContainer>
              <IconPlus
                size={theme.icon.size.md}
                stroke={theme.icon.stroke.sm}
              />
            </ListItemIconContainer>
          }
          hasSubmenu
          onClick={() => navigateToMoreWidgets(insertionContext)}
        >
          {t`Add widget`}
        </ListItemButton>
      </StyledMenuItemList>
    </StyledContainer>
  );
};
