import {
  PlaygroundSchemas,
  PlaygroundTypes,
} from '@/settings/playground/components/ApiPlaygroundSetupForm';
import GraphQLWrapper from '@/settings/playground/components/GraphQLWrapper';
import { RestApiWrapper } from '@/settings/playground/components/RestApiWrapper';
import { useParams } from 'react-router-dom';

const APIPlayground = () => {
  const { schema, type } = useParams<{
    schema: PlaygroundSchemas;
    type: PlaygroundTypes;
  }>();

  if (type === PlaygroundTypes.GRAPH_QL.toLocaleLowerCase()) {
    return <GraphQLWrapper schema={schema as PlaygroundSchemas} />;
  }

  return <RestApiWrapper />;
};

export default APIPlayground;
