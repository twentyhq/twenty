import { useIsNavigationDrawerContentExpanded } from '@/ui/navigation/navigation-drawer/hooks/useIsNavigationDrawerContentExpanded';
import { NavigationDrawerSection } from '@/ui/navigation/navigation-drawer/components/NavigationDrawerSection';
import { NavigationDrawerSectionTitle } from '@/ui/navigation/navigation-drawer/components/NavigationDrawerSectionTitle';
import { useNavigationSection } from '@/ui/navigation/navigation-drawer/hooks/useNavigationSection';
import { styled } from '@linaria/react';
import { type ReactNode, useId } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { Collapsible } from 'twenty-ui/primitives/layout';
import { themeCssVariables } from 'twenty-ui/theme';

const StyledItems = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.betweenSiblingsGap};
`;

type CollapsibleNavigationDrawerSectionProps = {
  // Namespaced id (e.g. 'settings/User') used to persist open/closed state unless isOpen is supplied.
  sectionId: string;
  label: string;
  children: ReactNode;
  rightIcon?: ReactNode;
  alwaysShowRightIcon?: boolean;
} & (
  | { isOpen: boolean; onOpenChange: (isOpen: boolean) => void }
  | { isOpen?: never; onOpenChange?: never }
);

export const CollapsibleNavigationDrawerSection = ({
  sectionId,
  label,
  children,
  rightIcon,
  alwaysShowRightIcon,
  isOpen,
  onOpenChange,
}: CollapsibleNavigationDrawerSectionProps) => {
  const panelId = useId();
  const isNavigationDrawerExpanded = useIsNavigationDrawerContentExpanded();
  const { toggleNavigationSection, isNavigationSectionOpen } =
    useNavigationSection(sectionId);
  const isSectionOpen = isOpen ?? isNavigationSectionOpen;

  const handleToggle = () => {
    if (!isDefined(isOpen)) {
      toggleNavigationSection();
    }

    onOpenChange?.(!isSectionOpen);
  };

  return (
    <NavigationDrawerSection>
      {isNavigationDrawerExpanded && (
        <NavigationDrawerSectionTitle
          label={label}
          rightIcon={rightIcon}
          alwaysShowRightIcon={alwaysShowRightIcon}
          onClick={handleToggle}
          isOpen={isSectionOpen}
          aria-controls={isSectionOpen ? panelId : undefined}
        />
      )}
      <Collapsible.Root open={!isNavigationDrawerExpanded || isSectionOpen}>
        <Collapsible.Panel id={panelId} dimension="height" containAnimation>
          <StyledItems>{children}</StyledItems>
        </Collapsible.Panel>
      </Collapsible.Root>
    </NavigationDrawerSection>
  );
};
