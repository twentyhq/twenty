import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

function Login() {
  const refreshToken = localStorage.getItem('refreshToken');
  const navigate = useNavigate();
  useEffect(() => {
    if (!refreshToken) {
      window.location.href =
        process.env.REACT_APP_AUTH_URL + '/signin/provider/google' || '';
    }
    navigate('/');
  }, [refreshToken, navigate]);

  return <></>;
}

export default Login;
