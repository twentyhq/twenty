import { useState } from 'react';
import styled from '@emotion/styled';
import { Button } from '@react-email/components';

import { AnalyticsQueryFilters } from '@/activities/reports/components/AnalyticsQueryFilters';
import { AnalyticsQuery } from '@/activities/reports/types/AnalyticsQuery';
import { useObjectMetadataItems } from '@/object-metadata/hooks/useObjectMetadataItems';
import { Select } from '@/ui/input/components/Select';
import { useRunAnalyticsQueryMutation } from '~/generated/graphql';

const StyledContainer = styled.div`
  display: flex;
  flex-direction: column;
`;

interface AnalyticsQueryEditorProps {
  analyticsQuery?: AnalyticsQuery;
}

export const AnalyticsQueryEditor = (props: AnalyticsQueryEditorProps) => {
  const { objectMetadataItems } = useObjectMetadataItems();
  const sourceObjectSelectOptions = objectMetadataItems.map(
    (objectMetadataItem) => ({
      value: objectMetadataItem.nameSingular,
      label: objectMetadataItem.labelPlural,
    }),
  );

  const [sourceObjectNameSingular, setSourceObjectNameSingular] =
    useState<string>();

  const [runAnalyticsQuery] = useRunAnalyticsQueryMutation();

  const fieldPathOptions: any[] = []; // TODO
  const measureOptions: any[] = []; // TODO
  const groupByOptions: any[] = []; // TODO

  return (
    <StyledContainer>
      <Select
        label="Source object"
        fullWidth
        dropdownId="source-object-select"
        options={sourceObjectSelectOptions}
        value={
          sourceObjectNameSingular ??
          props.analyticsQuery?.sourceObjectNameSingular ??
          sourceObjectSelectOptions?.[0].value
        }
        onChange={async (value) => {
          setSourceObjectNameSingular(value);
          // TODO: mutation
        }}
      />
      <AnalyticsQueryFilters analyticsQuery={props.analyticsQuery} />

      <Select
        label="Field"
        fullWidth
        dropdownId="field-path-select"
        options={fieldPathOptions}
      />

      <Select
        label="Measure"
        fullWidth
        dropdownId="measure-select"
        options={measureOptions}
      />

      <Select
        label="Group by"
        fullWidth
        dropdownId="measure-select"
        options={measureOptions}
      />

      {props.analyticsQuery && props.analyticsQuery.id && (
        <Button
          onClick={async () => {
            if (!props.analyticsQuery) throw new Error();

            await runAnalyticsQuery({
              variables: {
                analyticsQueryId: props.analyticsQuery.id,
              },
            });
          }}
        >
          Run
        </Button>
      )}
    </StyledContainer>
  );
};
