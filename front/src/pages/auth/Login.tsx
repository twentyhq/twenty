import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { hasAccessToken } from '../../services/auth/AuthService';

function Login() {
  const navigate = useNavigate();
  useEffect(() => {
    if (!hasAccessToken()) {
      window.location.href =
        process.env.REACT_APP_AUTH_URL + '/signin/provider/google' || '';
    } else {
      navigate('/');
    }
  }, [navigate]);

  return <></>;
}

export default Login;
