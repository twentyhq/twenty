import {
  openSidePanelPage,
  type OpenSidePanelPageParams,
  unmountFrontComponent,
  useFrontComponentId,
} from '@/sdk/front-component';
import { useEffect, useState } from 'react';

export type CommandOpenSidePanelPageProps = OpenSidePanelPageParams;

export const CommandOpenSidePanelPage = (
  props: CommandOpenSidePanelPageProps,
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
