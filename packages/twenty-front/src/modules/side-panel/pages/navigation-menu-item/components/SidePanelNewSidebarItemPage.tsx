import { useState } from 'react';

import { SidePanelNewSidebarItemMainMenu } from '@/side-panel/pages/navigation-menu-item/components/SidePanelNewSidebarItemMainMenu';
import { SidePanelNewSidebarItemObjectFlow } from '@/side-panel/pages/navigation-menu-item/components/SidePanelNewSidebarItemObjectFlow';
import { SidePanelNewSidebarItemRecordSubView } from '@/side-panel/pages/navigation-menu-item/components/SidePanelNewSidebarItemRecordSubView';
import { SidePanelNewSidebarItemViewFlow } from '@/side-panel/pages/navigation-menu-item/components/SidePanelNewSidebarItemViewFlow';

type SelectedOption = 'object' | 'record' | 'view' | null;

export const SidePanelNewSidebarItemPage = () => {
  const [selectedOption, setSelectedOption] = useState<SelectedOption>(null);

  const handleBackToMain = () => {
    setSelectedOption(null);
  };

  switch (selectedOption) {
    case 'view':
      return <SidePanelNewSidebarItemViewFlow onBack={handleBackToMain} />;
    case 'object':
      return <SidePanelNewSidebarItemObjectFlow onBack={handleBackToMain} />;
    case 'record':
      return <SidePanelNewSidebarItemRecordSubView onBack={handleBackToMain} />;
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
