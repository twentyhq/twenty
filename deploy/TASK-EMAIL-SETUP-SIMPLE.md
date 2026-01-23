# TASK: Configure SMTP Email (Simple)

## COMPLETED

Email configuration has been completed on the server.

## Configuration Applied
- **SMTP Server:** mail.sigmanet.lv
- **Port:** 465 (SSL)
- **From:** noreply@controlitfactory.eu
- **System:** system@controlitfactory.eu

## Verify Status
```bash
cd /opt/controlit-crm
docker compose ps
docker compose logs server | grep -i email
```

---

**NOTE:** Credentials are stored only on the server, not in version control.
