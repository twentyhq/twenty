import { Helmet } from '@dr.pogodin/react-helmet';

import { useIsInSidePanelRoutedSurface } from '@/side-panel/routing/hooks/useIsInSidePanelRoutedSurface';

type PageTitleProps = {
  title: string;
};

export const PageTitle = (props: PageTitleProps) => {
  const isInSidePanelRoutedSurface = useIsInSidePanelRoutedSurface();

  // A page hosted on the right is not what the browser tab is showing.
  if (isInSidePanelRoutedSurface) {
    return null;
  }

  return (
    <Helmet>
      <title>{props.title}</title>
    </Helmet>
  );
};
