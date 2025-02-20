'use client';
import { explorerPlugin } from '@graphiql/plugin-explorer';
import { createGraphiQLFetcher } from '@graphiql/toolkit';
import { GraphiQL } from 'graphiql';



import { SettingsPath } from '@/types/SettingsPath';
import { SubMenuTopBarContainer } from '@/ui/layout/page/components/SubMenuTopBarContainer';
import '@graphiql/plugin-explorer/dist/style.css';
import { Trans } from '@lingui/react/macro';
import 'graphiql/graphiql.css';
import { getSettingsPath } from '~/utils/navigation/getSettingsPath';

const SubDocToPath : Record<string, string> = {
  core: 'graphql',
  metadata: 'metadata',
};




const GraphQlPlayground = ({baseurl,   subdoc, token}: any) => {

  const explorer = explorerPlugin({
    showAttribution: true,
  });
  const path = SubDocToPath[subdoc as any] as string;

  const fetcher = createGraphiQLFetcher({
    url: baseurl + '/' + path,
  });



  return (
    <div style={{ height: '100vh', width: '100vw', position: 'absolute', zIndex: 1000, left: 0, textTransform: 'capitalize' }}>
             <SubMenuTopBarContainer
             className='playgroundcontainer'
                    links={[
                      { children: <Trans>APIs</Trans>, href: getSettingsPath(SettingsPath.DevelopersApiKeysMain) },
                      { children: <Trans>GraphQL</Trans> },
                      { children: <Trans>{subdoc}</Trans> },
                    ]}
                  >

     <section style={{height: '100%'}}>
     <GraphiQL
        plugins={[explorer]}
        fetcher={fetcher}
        defaultHeaders={JSON.stringify({ Authorization: `Bearer ${token}` })}
      />
      </section>
     </SubMenuTopBarContainer>

    </div>
  );

}


export default GraphQlPlayground;
