import { Auth0Provider } from '@auth0/auth0-react';
import React, { useEffect } from 'react';
import Inbox from './pages/inbox/Inbox';
import Contacts from './pages/Contacts';
import Insights from './pages/Insights';
import AuthCallback from './pages/AuthCallback';
import AppLayout from './layout/AppLayout';
import RequireAuth from './components/RequireAuth';
import { Routes, Route } from 'react-router-dom';
import { useGetProfile } from './hooks/profile/useGetProfile';
import { useGetTenantByDomain } from './hooks/tenant/useGetTenantByDomain';

function App() {
  const { tenant } = useGetTenantByDomain();
  const { user } = useGetProfile();

  return (
    <div>
      {tenant && (
        <Auth0Provider
          domain={process.env.REACT_APP_AUTH0_DOMAIN || ''}
          clientId={tenant?.auth0_client_id || ''}
          authorizationParams={{
            redirect_uri:
              window.location.protocol +
                '//' +
                window.location.host +
                process.env.REACT_APP_AUTH0_CALLBACK_URL || '',
            audience: process.env.REACT_APP_AUTH0_AUDIENCE || '',
          }}
        >
          <AppLayout user={user}>
            <Routes>
              <Route
                path="/"
                element={
                  <RequireAuth>
                    <Inbox />
                  </RequireAuth>
                }
              />
              <Route
                path="/contacts"
                element={
                  <RequireAuth>
                    <Contacts />
                  </RequireAuth>
                }
              />
              <Route
                path="/insights"
                element={
                  <RequireAuth>
                    <Insights />
                  </RequireAuth>
                }
              />
              <Route path="/auth/callback" element={<AuthCallback />} />
            </Routes>
          </AppLayout>
        </Auth0Provider>
      )}
    </div>
  );
}

export default App;
