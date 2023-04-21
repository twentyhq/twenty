import { useSearchParams, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { refreshAccessToken } from '../../services/AuthService';

function Callback() {
  const [searchParams] = useSearchParams();
  const [isLoading, setIsLoading] = useState(true);

  const refreshToken = searchParams.get('refreshToken');
  localStorage.setItem('refreshToken', refreshToken || '');
  const navigate = useNavigate();

  useEffect(() => {
    async function getAccessToken() {
      await refreshAccessToken();
      setIsLoading(false);
      navigate('/');
    }

    if (isLoading) {
      getAccessToken();
    }
  }, [isLoading, navigate]);

  return <></>;
}

export default Callback;
