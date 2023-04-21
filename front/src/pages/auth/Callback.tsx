import { useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';

function Callback() {
  const [searchParams] = useSearchParams();
  const refreshToken = searchParams.get('refreshToken');
  localStorage.setItem('refreshToken', refreshToken || '');

  const navigate = useNavigate();
  useEffect(() => {
    navigate('/');
  }, [navigate]);

  return <></>;
}

export default Callback;
