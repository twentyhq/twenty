import { Helmet } from 'react-helmet-async';

export const ServerPreconnect = () => {
  return (
    <Helmet>
      <link
        rel="preconnect"
        href={process.env.REACT_APP_SERVER_BASE_URL || 'http://localhost:3000'}
      />
    </Helmet>
  );
};
