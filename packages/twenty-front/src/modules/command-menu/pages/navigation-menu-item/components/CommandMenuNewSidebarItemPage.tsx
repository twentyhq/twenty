import { useState } from 'react';
import { isDefined } from 'twenty-shared/utils';

import { CommandMenuNewSidebarItemMainMenu } from '@/command-menu/pages/navigation-menu-item/components/CommandMenuNewSidebarItemMainMenu';
import { CommandMenuNewSidebarItemObjectFlow } from '@/command-menu/pages/navigation-menu-item/components/CommandMenuNewSidebarItemObjectFlow';
import { CommandMenuNewSidebarItemRecordSubView } from '@/command-menu/pages/navigation-menu-item/components/CommandMenuNewSidebarItemRecordSubView';
import { CommandMenuNewSidebarItemViewFlow } from '@/command-menu/pages/navigation-menu-item/components/CommandMenuNewSidebarItemViewFlow';
import { addMenuItemInsertionContextState } from '@/navigation-menu-item/states/addMenuItemInsertionContextState';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';

type SelectedOption = 'object' | 'record' | 'view' | null;

export const CommandMenuNewSidebarItemPage = () => {
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
      return <CommandMenuNewSidebarItemViewFlow onBack={handleBackToMain} />;
    case 'object':
      return <CommandMenuNewSidebarItemObjectFlow onBack={handleBackToMain} />;
    case 'record':
      return (
        <CommandMenuNewSidebarItemRecordSubView
          onBack={handleBackToMain}
          disableDrag={disableDrag}
        />
      );
    default:
      return (
        <CommandMenuNewSidebarItemMainMenu
          onSelectRecord={() => setSelectedOption('record')}
          onSelectObject={() => setSelectedOption('object')}
          onSelectView={() => setSelectedOption('view')}
        />
      );
  }
};
