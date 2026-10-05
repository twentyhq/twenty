import {
  type AppPath,
  openSidePanelPage,
  type OpenSidePanelPageParams,
  unmountFrontComponent,
  useFrontComponentId,
} from '@/sdk/front-component';
import { useEffect, useState } from 'react';

export type CommandOpenSidePanelPageProps<T extends AppPath = AppPath> =
  OpenSidePanelPageParams<T>;

export const CommandOpenSidePanelPage = <T extends AppPath>(
  props: CommandOpenSidePanelPageProps<T>,
) => {
  const [hasExecuted, setHasExecuted] = useState(false);

  const frontComponentId = useFrontComponentId();

  useEffect(() => {
    if (hasExecuted) {
      return;
    }

    setHasExecuted(true);

    const run = async () => {
      await openSidePanelPage(props);

      await unmountFrontComponent();
    };

    run();
  }, [props, hasExecuted, frontComponentId]);

  return null;
};
