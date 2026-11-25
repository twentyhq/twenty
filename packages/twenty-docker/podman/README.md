# How to deploy twenty on podman

DISCLAIMER: The k8s and podman deployments are not maintained by the core team.
These files are provided and maintained by the community. Twenty core team
maintains support for docker deployment.


## How to use

1. Edit `.env` file. At the minimum set `POSTGRES_PASSWORD`, `SERVER_URL`, and `APP_SECRET`.
2. Start twenty by running `podman-compose up -d`.

If you need to stop twenty, you can do so by running `podman-compose down`.


### Install systemd service (optional)

If you want to install a systemd service to run twenty, you can use the provided systemd service. 

Edit `twentycrm.service` and change these two variables:


	WorkingDirectory=/opt/apps/twenty
	EnvironmentFile=/opt/apps/twenty/.env

`WorkingDirectory` should be changed to the path in which `podman-compose.yml` is located.

`EnvironmentFile` should be changed to the path in which your `.env`file is located.

You can run the script `install-systemd-user-service` to install the systemd service under the current user.


	./install-systemd-user-service

Note: this script will enable the service and also start it. So it will assume that twenty is not currently running.
If you started it previously, bring it down using:

	podman-compose down



## Compatibility

These files require Podman 4.3+ and podman-compose 1.0.6 or newer.

Older podman-compose versions, including Debian 12's 1.0.3 package, ignore
`stop_grace_period` and can kill the server before its HTTP drain and recorder
flush finish. Upgrade podman-compose before using this deployment; keep the
server's configured 120-second stop grace.


