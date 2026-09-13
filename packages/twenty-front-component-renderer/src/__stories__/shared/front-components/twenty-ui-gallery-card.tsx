import { type ComponentProps } from 'react';
import 'twenty-ui/style.css';
import { ThemeProvider } from 'twenty-ui/theme-constants';

import { FrontComponentCard } from '@/__stories__/shared/front-components/front-component-card';

type TwentyUiGalleryCardProps = ComponentProps<typeof FrontComponentCard>;

export const TwentyUiGalleryCard = ({
  title,
  children,
}: TwentyUiGalleryCardProps) => (
  <ThemeProvider colorScheme="light">
    <FrontComponentCard title={title}>{children}</FrontComponentCard>
  </ThemeProvider>
);
