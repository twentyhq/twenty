import { useState } from 'react';
import { FrontComponentContent } from 'twenty-shared/front-component';

import { PageLayoutWidgetNoDataDisplay } from '@/page-layout/widgets/components/PageLayoutWidgetNoDataDisplay';

type FrontComponentWidgetContentProps = {
  frontComponentId: string;
};

export const FrontComponentWidgetContent = ({
  frontComponentId: _frontComponentId,
}: FrontComponentWidgetContentProps) => {
  const [hasError, setHasError] = useState(false);

  if (hasError) {
    return <PageLayoutWidgetNoDataDisplay />;
  }

  return (
    <FrontComponentContent
      componentUrl={'../mock/mock-front-component.ts'}
      setHasError={setHasError}
    />
  );
};
