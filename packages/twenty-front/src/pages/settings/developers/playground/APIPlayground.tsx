import GraphQLWrapper from '@/settings/api/playground/components/GraphQLWrapper';
import { RestApiWrapper } from '@/settings/api/playground/components/RestApiWrapper';
import { PlaygroundSchemas, PlaygroundTypes } from '@/settings/api/playground/form/components/ApiPlaygroundSetupForm';
import { useParams } from 'react-router-dom';

const APIPlayground = () => {
  const { schema, type } = useParams<{schema: PlaygroundSchemas, type: PlaygroundTypes }>()
  
  if (type === PlaygroundTypes.GRAPH_QL) {
    return <GraphQLWrapper subDoc={schema as PlaygroundSchemas} />;
  }

  return <RestApiWrapper subDoc={schema as PlaygroundSchemas}/>
};

export default APIPlayground;
