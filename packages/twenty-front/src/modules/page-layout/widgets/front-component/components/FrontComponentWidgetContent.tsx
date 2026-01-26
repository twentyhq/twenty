import { useQuery } from '@apollo/client';

import { isDefined } from 'twenty-shared/utils';

import { PageLayoutWidgetNoDataDisplay } from '@/page-layout/widgets/components/PageLayoutWidgetNoDataDisplay';
import { WidgetSkeletonLoader } from '@/page-layout/widgets/components/WidgetSkeletonLoader';
import { GET_FRONT_COMPONENT_CODE } from '@/page-layout/widgets/front-component/graphql/queries/getFrontComponentCode';
import { useState } from 'react';
import { FrontComponentContent } from 'twenty-shared/front-component';

type FrontComponentWidgetContentProps = {
  frontComponentId: string;
};

export const FrontComponentWidgetContent = ({
  frontComponentId,
}: FrontComponentWidgetContentProps) => {
  const [hasError, setHasError] = useState(false);

  const { data, loading, error } = useQuery(GET_FRONT_COMPONENT_CODE, {
    variables: { id: frontComponentId },
  });

  if (loading) {
    return <WidgetSkeletonLoader />;
  }

  const componentCode = data?.getFrontComponentCode?.componentCode;

  if (isDefined(error) || hasError || !isDefined(componentCode)) {
    return <PageLayoutWidgetNoDataDisplay />;
  }

  return (
    <FrontComponentContent
      componentCode={componentCode}
      setHasError={setHasError}
    />
  );
};
