import { useSearchParams, useNavigate } from 'react-router-dom';
import { useRefreshToken } from '../../hooks/auth/useRefreshToken';
import { useEffect } from 'react';

function Callback() {
  const [searchParams] = useSearchParams();
  const refreshToken = searchParams.get('refreshToken');
  localStorage.setItem('refreshToken', refreshToken || '');
  const { loading } = useRefreshToken();
  const navigate = useNavigate();
  useEffect(() => {
    if (!loading) {
      navigate('/');
    }
  }, [navigate, loading]);

  return <></>;
}

export default Callback;
