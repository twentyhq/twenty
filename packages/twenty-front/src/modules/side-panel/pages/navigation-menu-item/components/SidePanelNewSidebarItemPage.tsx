import { useState } from 'react';

import { addMenuItemInsertionContextState } from '@/navigation-menu-item/states/addMenuItemInsertionContextState';
import { SidePanelNewSidebarItemMainMenu } from '@/side-panel/pages/navigation-menu-item/components/SidePanelNewSidebarItemMainMenu';
import { SidePanelNewSidebarItemObjectFlow } from '@/side-panel/pages/navigation-menu-item/components/SidePanelNewSidebarItemObjectFlow';
import { SidePanelNewSidebarItemRecordSubView } from '@/side-panel/pages/navigation-menu-item/components/SidePanelNewSidebarItemRecordSubView';
import { SidePanelNewSidebarItemViewFlow } from '@/side-panel/pages/navigation-menu-item/components/SidePanelNewSidebarItemViewFlow';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { isDefined } from 'twenty-shared/utils';

type SelectedOption = 'object' | 'record' | 'view' | null;

export const SidePanelNewSidebarItemPage = () => {
  const [selectedOption, setSelectedOption] = useState<SelectedOption>(null);
  const addMenuItemInsertionContext = useAtomStateValue(
    addMenuItemInsertionContextState,
  );
  const disableDrag = isDefined(addMenuItemInsertionContext);

  const handleBackToMain = () => {
    setSelectedOption(null);
  };

  switch (selectedOption) {
    case 'view':
      return <SidePanelNewSidebarItemViewFlow onBack={handleBackToMain} />;
    case 'object':
      return <SidePanelNewSidebarItemObjectFlow onBack={handleBackToMain} />;
    case 'record':
      return (
        <SidePanelNewSidebarItemRecordSubView
          onBack={handleBackToMain}
          disableDrag={disableDrag}
        />
      );
    default:
      return (
        <SidePanelNewSidebarItemMainMenu
          onSelectRecord={() => setSelectedOption('record')}
          onSelectObject={() => setSelectedOption('object')}
          onSelectView={() => setSelectedOption('view')}
        />
      );
  }
};
