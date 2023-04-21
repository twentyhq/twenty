import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

function Login() {
  const refreshToken = localStorage.getItem('refreshToken');
  const navigate = useNavigate();
  useEffect(() => {
    if (!refreshToken) {
      window.location.href = process.env.REACT_APP_LOGIN_PROVIDER_URL || '';
    }
    navigate('/');
  }, [refreshToken, navigate]);

  return <></>;
}

export default Login;
